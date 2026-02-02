import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { v4 as uuidv4 } from 'uuid';

import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { LogicFunctionService } from 'src/engine/metadata-modules/logic-function/services/logic-function.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-type.enum';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { Repository } from 'typeorm';

const OLD_BUILT_FOLDER = 'built-function';
const OLD_SOURCE_FOLDER = 'serverless-function';
const SEED_VERSION = 'draft';

@Command({
  name: 'upgrade:1-17:seed-workflow-v1-16',
  description:
    '[Temporary] Seed a workflow + workflowVersion + logic function in v1.16 format (serverlessFunctionId, old file paths) for testing the 1-17 migrate-workflow-code-steps command.',
})
export class SeedWorkflowV1_16Command extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(SeedWorkflowV1_16Command.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly logicFunctionService: LogicFunctionService,
    private readonly fileStorageService: FileStorageService,
    private readonly recordPositionService: RecordPositionService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Seeding workflow v1.16 data for workspace ${workspaceId}`,
    );

    const flatLogicFunction = await this.logicFunctionService.createOne({
      input: {
        name: 'Seed code step (v1.16)',
        description: 'Temporary logic function for 1.17 migration testing',
        timeoutSeconds: 300,
        isTool: false,
      },
      workspaceId,
    });

    const logicFunctionId = flatLogicFunction.id;

    await this.writeOldFormatFiles(logicFunctionId);

    const workflowId = uuidv4();
    const workflowVersionId = uuidv4();
    const codeStepId = uuidv4();

    const workflowPosition =
      await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflow',
        },
        workspaceId,
      });

    const workflowVersionPosition =
      await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflowVersion',
        },
        workspaceId,
      });

    const workflowRepository =
      await this.globalWorkspaceOrmManager.getRepository(workspaceId, 'workflow', {
        shouldBypassPermissionChecks: true,
      });

    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    await workflowRepository.insert({
      id: workflowId,
      name: 'Seed workflow (v1.16)',
      statuses: [WorkflowStatus.DRAFT],
      position: workflowPosition,
    });

    const trigger: { name: string; type: string; settings: { outputSchema: object } } = {
      name: 'trigger',
      type: WorkflowTriggerType.MANUAL,
      settings: { outputSchema: {} },
    };

    const steps = [
      {
        id: codeStepId,
        name: 'Code step',
        type: WorkflowActionType.CODE,
        settings: {
          input: {
            serverlessFunctionId: logicFunctionId,
            serverlessFunctionInput: {},
            serverlessFunctionVersion: SEED_VERSION,
          },
          outputSchema: {
            link: {
              tab: 'test',
              icon: 'IconVariable',
              label: 'Generate Function Output',
              isLeaf: true,
            },
            _outputSchemaType: 'LINK',
          },
        },
        valid: true,
      },
    ];

    await workflowVersionRepository.insert({
      id: workflowVersionId,
      workflowId,
      name: 'v1',
      status: WorkflowVersionStatus.DRAFT,
      trigger,
      steps,
      position: workflowVersionPosition,
    });

    this.logger.log(
      `Seeded workflow ${workflowId}, workflowVersion ${workflowVersionId}, logicFunction ${logicFunctionId} (v1.16 format) in workspace ${workspaceId}. Run upgrade:1-17:migrate-workflow-code-steps to test migration.`,
    );
  }

  private async writeOldFormatFiles(logicFunctionId: string): Promise<void> {
    const builtFolder = `${OLD_BUILT_FOLDER}/${logicFunctionId}/${SEED_VERSION}`;
    const sourceFolder = `${OLD_SOURCE_FOLDER}/${logicFunctionId}/${SEED_VERSION}`;

    const builtSources = {
      'index.mjs': 'export default async function main() { return { message: "ok" }; }\n',
    };
    const sourceSources = {
      src: {
        'index.ts':
          'export default async function main(): Promise<{ message: string }> {\n  return { message: "ok" };\n}\n',
      },
    };

    await this.fileStorageService.writeFolder(builtSources, builtFolder);
    await this.fileStorageService.writeFolder(sourceSources, sourceFolder);
  }
}
