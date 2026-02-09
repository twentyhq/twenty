import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import {
  DEFAULT_BUILT_HANDLER_PATH,
  DEFAULT_HANDLER_NAME,
  DEFAULT_SOURCE_HANDLER_PATH,
  LogicFunctionEntity,
  LogicFunctionRuntime,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-type.enum';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const OLD_BUILT_FOLDER = 'built-function';
const OLD_SOURCE_FOLDER = 'serverless-function';
const SEED_VERSION_DRAFT = 'draft';
const SEED_VERSION_PUBLISHED = '1';

const OUTPUT_SCHEMA_LINK = {
  link: {
    tab: 'test',
    icon: 'IconVariable',
    label: 'Generate Function Output',
    isLeaf: true,
  },
  _outputSchemaType: 'LINK',
} as const;

const OUTPUT_SCHEMA_MESSAGE = {
  message: {
    type: 'string',
    label: 'message',
    value: 'Hello, input: null and null',
    isLeaf: true,
  },
} as const;

@Command({
  name: 'upgrade:1-17:seed-workflow-v1-16',
  description:
    '[Temporary] Clean existing workflow runs, workflow versions, workflows, logic functions and old file storage, then seed 3 scenarios: (1) draft+active with LINK outputSchema, (2) draft-only with message outputSchema, (3) draft+active with mixed outputSchema (message on draft, LINK on active). For testing the 1-17 migrate-workflow-code-steps command.',
})
export class SeedWorkflowV1_16Command extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(SeedWorkflowV1_16Command.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly fileStorageService: FileStorageService,
    private readonly recordPositionService: RecordPositionService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(`Seeding workflow v1.16 data for workspace ${workspaceId}`);

    await this.cleanWorkflowsAndOldFileStorage(workspaceId);

    const workflowRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'workflow',
        {
          shouldBypassPermissionChecks: true,
        },
      );
    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    await this.seedScenarioDraftAndActiveLink(
      workspaceId,
      workflowRepository,
      workflowVersionRepository,
    );
    await this.seedScenarioDraftOnlyMessage(
      workspaceId,
      workflowRepository,
      workflowVersionRepository,
    );
    await this.seedScenarioDraftAndActiveMixedOutputSchema(
      workspaceId,
      workflowRepository,
      workflowVersionRepository,
    );

    this.logger.log(
      `Seeded 3 workflows (draft+active LINK, draft-only message, draft+active mixed outputSchema) in workspace ${workspaceId}. Run upgrade:1-17:migrate-workflow-code-steps to test migration.`,
    );
  }

  private buildCodeStep(
    logicFunctionId: string,
    version: string,
    outputSchema: object,
    stepName: string,
  ) {
    return {
      id: uuidv4(),
      name: stepName,
      type: WorkflowActionType.CODE,
      settings: {
        input: {
          serverlessFunctionId: logicFunctionId,
          serverlessFunctionInput: {},
          serverlessFunctionVersion: version,
        },
        outputSchema,
      },
      valid: true,
    };
  }

  private buildTrigger(): {
    name: string;
    type: string;
    settings: { outputSchema: object };
  } {
    return {
      name: 'trigger',
      type: WorkflowTriggerType.MANUAL,
      settings: { outputSchema: {} },
    };
  }

  private async seedScenarioDraftAndActiveLink(
    workspaceId: string,
    workflowRepository: Awaited<
      ReturnType<GlobalWorkspaceOrmManager['getRepository']>
    >,
    workflowVersionRepository: Awaited<
      ReturnType<GlobalWorkspaceOrmManager['getRepository']>
    >,
  ): Promise<void> {
    const logicFunctionId = await this.insertLogicFunctionRow(
      workspaceId,
      'Seed (draft+active LINK)',
    );

    await this.writeOldFormatFiles(logicFunctionId, SEED_VERSION_DRAFT);
    await this.writeOldFormatFiles(logicFunctionId, SEED_VERSION_PUBLISHED);

    const workflowId = uuidv4();
    const draftVersionId = uuidv4();
    const activeVersionId = uuidv4();

    const workflowPosition =
      await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflow',
        },
        workspaceId,
      });
    const draftVersionPosition =
      await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflowVersion',
        },
        workspaceId,
      });
    const activeVersionPosition =
      await this.recordPositionService.buildRecordPosition({
        value: 'last',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflowVersion',
        },
        workspaceId,
      });

    await workflowRepository.insert({
      id: workflowId,
      name: 'Seed draft+active (LINK)',
      statuses: [WorkflowStatus.DRAFT],
      position: workflowPosition,
    });

    const trigger = this.buildTrigger();
    const draftSteps = [
      this.buildCodeStep(
        logicFunctionId,
        SEED_VERSION_DRAFT,
        OUTPUT_SCHEMA_LINK,
        'Code step (draft)',
      ),
    ];
    const activeSteps = [
      this.buildCodeStep(
        logicFunctionId,
        SEED_VERSION_PUBLISHED,
        OUTPUT_SCHEMA_LINK,
        'Code step (v1)',
      ),
    ];

    await workflowVersionRepository.insert({
      id: draftVersionId,
      workflowId,
      name: 'v1',
      status: WorkflowVersionStatus.DRAFT,
      trigger,
      steps: draftSteps,
      position: draftVersionPosition,
    });
    await workflowVersionRepository.insert({
      id: activeVersionId,
      workflowId,
      name: 'v2',
      status: WorkflowVersionStatus.ACTIVE,
      trigger,
      steps: activeSteps,
      position: activeVersionPosition,
    });
    await workflowRepository.update(workflowId, {
      lastPublishedVersionId: activeVersionId,
      statuses: [WorkflowStatus.ACTIVE],
    });
  }

  private async seedScenarioDraftOnlyMessage(
    workspaceId: string,
    workflowRepository: Awaited<
      ReturnType<GlobalWorkspaceOrmManager['getRepository']>
    >,
    workflowVersionRepository: Awaited<
      ReturnType<GlobalWorkspaceOrmManager['getRepository']>
    >,
  ): Promise<void> {
    const logicFunctionId = await this.insertLogicFunctionRow(
      workspaceId,
      'Seed (draft-only message)',
    );

    await this.writeOldFormatFiles(logicFunctionId, SEED_VERSION_DRAFT);

    const workflowId = uuidv4();
    const draftVersionId = uuidv4();

    const workflowPosition =
      await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflow',
        },
        workspaceId,
      });
    const draftVersionPosition =
      await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflowVersion',
        },
        workspaceId,
      });

    await workflowRepository.insert({
      id: workflowId,
      name: 'Seed draft-only (message)',
      statuses: [WorkflowStatus.DRAFT],
      position: workflowPosition,
    });

    const trigger = this.buildTrigger();
    const draftSteps = [
      this.buildCodeStep(
        logicFunctionId,
        SEED_VERSION_DRAFT,
        OUTPUT_SCHEMA_MESSAGE,
        'Code step (draft)',
      ),
    ];

    await workflowVersionRepository.insert({
      id: draftVersionId,
      workflowId,
      name: 'v1',
      status: WorkflowVersionStatus.DRAFT,
      trigger,
      steps: draftSteps,
      position: draftVersionPosition,
    });
  }

  private async seedScenarioDraftAndActiveMixedOutputSchema(
    workspaceId: string,
    workflowRepository: Awaited<
      ReturnType<GlobalWorkspaceOrmManager['getRepository']>
    >,
    workflowVersionRepository: Awaited<
      ReturnType<GlobalWorkspaceOrmManager['getRepository']>
    >,
  ): Promise<void> {
    const logicFunctionId = await this.insertLogicFunctionRow(
      workspaceId,
      'Seed (draft+active mixed)',
    );

    await this.writeOldFormatFiles(logicFunctionId, SEED_VERSION_DRAFT);
    await this.writeOldFormatFiles(logicFunctionId, SEED_VERSION_PUBLISHED);

    const workflowId = uuidv4();
    const draftVersionId = uuidv4();
    const activeVersionId = uuidv4();

    const workflowPosition =
      await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflow',
        },
        workspaceId,
      });
    const draftVersionPosition =
      await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflowVersion',
        },
        workspaceId,
      });
    const activeVersionPosition =
      await this.recordPositionService.buildRecordPosition({
        value: 'last',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflowVersion',
        },
        workspaceId,
      });

    await workflowRepository.insert({
      id: workflowId,
      name: 'Seed draft+active (mixed)',
      statuses: [WorkflowStatus.DRAFT],
      position: workflowPosition,
    });

    const trigger = this.buildTrigger();
    const draftSteps = [
      this.buildCodeStep(
        logicFunctionId,
        SEED_VERSION_DRAFT,
        OUTPUT_SCHEMA_MESSAGE,
        'Code step (draft, message)',
      ),
    ];
    const activeSteps = [
      this.buildCodeStep(
        logicFunctionId,
        SEED_VERSION_PUBLISHED,
        OUTPUT_SCHEMA_LINK,
        'Code step (v1, LINK)',
      ),
    ];

    await workflowVersionRepository.insert({
      id: draftVersionId,
      workflowId,
      name: 'v1',
      status: WorkflowVersionStatus.DRAFT,
      trigger,
      steps: draftSteps,
      position: draftVersionPosition,
    });
    await workflowVersionRepository.insert({
      id: activeVersionId,
      workflowId,
      name: 'v2',
      status: WorkflowVersionStatus.ACTIVE,
      trigger,
      steps: activeSteps,
      position: activeVersionPosition,
    });
    await workflowRepository.update(workflowId, {
      lastPublishedVersionId: activeVersionId,
      statuses: [WorkflowStatus.ACTIVE],
    });
  }

  private async insertLogicFunctionRow(
    workspaceId: string,
    name: string = 'Seed code step (v1.16)',
  ): Promise<string> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const applicationId = workspaceCustomFlatApplication.id;
    const id = uuidv4();
    const universalIdentifier = uuidv4();
    const now = new Date();

    await this.logicFunctionRepository.insert({
      id,
      workspaceId,
      universalIdentifier,
      applicationId,
      name,
      description: 'Temporary logic function for 1.17 migration testing',
      sourceHandlerPath: DEFAULT_SOURCE_HANDLER_PATH,
      builtHandlerPath: DEFAULT_BUILT_HANDLER_PATH,
      handlerName: DEFAULT_HANDLER_NAME,
      runtime: LogicFunctionRuntime.NODE22,
      timeoutSeconds: 300,
      checksum: null,
      toolInputSchema: null,
      isTool: false,
      cronTriggerSettings: null,
      databaseEventTriggerSettings: null,
      httpRouteTriggerSettings: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    return id;
  }

  private async cleanWorkflowsAndOldFileStorage(
    workspaceId: string,
  ): Promise<void> {
    const workflowRunRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'workflowRun',
        { shouldBypassPermissionChecks: true },
      );
    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );
    const workflowRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'workflow',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const deletedRuns = await workflowRunRepository.delete({});
    const deletedVersions = await workflowVersionRepository.delete({});
    const deletedWorkflows = await workflowRepository.delete({});

    const deletedLogicFunctions = await this.logicFunctionRepository.delete({
      workspaceId,
    });

    this.logger.log(
      `Cleaned workspace ${workspaceId}: ${deletedRuns.affected ?? 0} workflow run(s), ${deletedVersions.affected ?? 0} workflow version(s), ${deletedWorkflows.affected ?? 0} workflow(s), ${deletedLogicFunctions.affected ?? 0} logic function(s)`,
    );

    try {
      await this.fileStorageService.deleteLegacy({
        folderPath: OLD_BUILT_FOLDER,
      });
      await this.fileStorageService.deleteLegacy({
        folderPath: OLD_SOURCE_FOLDER,
      });
      this.logger.log(
        `Cleaned old file storage: ${OLD_BUILT_FOLDER}, ${OLD_SOURCE_FOLDER}`,
      );
    } catch (error) {
      this.logger.warn(
        `Old file storage cleanup skipped (folders may not exist): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async writeOldFormatFiles(
    logicFunctionId: string,
    version: string,
  ): Promise<void> {
    const builtFolder = `${OLD_BUILT_FOLDER}/${logicFunctionId}/${version}`;
    const sourceFolder = `${OLD_SOURCE_FOLDER}/${logicFunctionId}/${version}`;

    const builtSources = {
      'index.mjs':
        'export default async function main() { return { message: "ok" }; }\n',
    };
    const sourceSources = {
      src: {
        'index.ts':
          'export default async function main(): Promise<{ message: string }> {\n  return { message: "ok" };\n}\n',
      },
    };

    await this.fileStorageService.writeFolderLegacy(builtSources, builtFolder);
    await this.fileStorageService.writeFolderLegacy(
      sourceSources,
      sourceFolder,
    );
  }
}
