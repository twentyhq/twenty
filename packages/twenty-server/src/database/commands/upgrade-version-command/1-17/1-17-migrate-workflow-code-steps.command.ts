import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { Command } from 'nest-commander';
import { FileFolder, type Sources } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import {
  type CodeStepMigrationTarget,
  collectCodeStepMigrationTargets,
  migrateWorkflowCodeStepsWithMapping,
  type ServerlessToLogicFunctionMapping,
} from 'src/database/commands/upgrade-version-command/1-17/utils/migrate-workflow-code-step.util';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionMetadataService } from 'src/engine/metadata-modules/logic-function/services/logic-function-metadata.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

const OLD_BUILT_FOLDER = 'built-function';
const OLD_SOURCE_FOLDER = 'serverless-function';
const NEW_WORKFLOW_RESOURCE_PREFIX = 'workflow';

@Command({
  name: 'upgrade:1-17:migrate-workflow-code-steps',
  description:
    'Migrate workflow code steps from v1.16 (serverless) to v1.17 (logic function): create new logic function per (serverlessFunctionId, version), move files, update steps, delete old logic function.',
})
export class MigrateWorkflowCodeStepsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(MigrateWorkflowCodeStepsCommand.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly fileStorageService: FileStorageService,
    private readonly applicationService: ApplicationService,
    private readonly logicFunctionMetadataService: LogicFunctionMetadataService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `Running MigrateWorkflowCodeStepsCommand for workspace ${workspaceId}`,
    );

    const workflowVersionRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersions = await workflowVersionRepository.find({
      select: ['id', 'steps', 'status'],
      where: {
        status: In([WorkflowVersionStatus.DRAFT, WorkflowVersionStatus.ACTIVE]),
      },
    });

    const allTargets = new Map<string, CodeStepMigrationTarget>();

    for (const version of workflowVersions) {
      const targets = collectCodeStepMigrationTargets(version.steps);

      for (const target of targets) {
        const key = `${target.serverlessFunctionId}:${target.serverlessFunctionVersion}`;

        if (!allTargets.has(key)) {
          allTargets.set(key, target);
        }
      }
    }

    const targetsList = Array.from(allTargets.values());

    if (targetsList.length === 0) {
      this.logger.log(`No code steps to migrate in workspace ${workspaceId}`);

      return;
    }

    const mapping = new Map<string, string>();

    if (!isDryRun) {
      for (const target of targetsList) {
        const newLogicFunctionId =
          await this.createLogicFunctionAndMigrateFiles(workspaceId, target);

        if (isDefined(newLogicFunctionId)) {
          const key = `${target.serverlessFunctionId}:${target.serverlessFunctionVersion}`;

          mapping.set(key, newLogicFunctionId);
        }
      }

      const serverlessToLogicMapping: ServerlessToLogicFunctionMapping = (
        serverlessFunctionId,
        serverlessFunctionVersion,
      ) => {
        const key = `${serverlessFunctionId}:${serverlessFunctionVersion}`;
        const newId = mapping.get(key);

        if (!isDefined(newId)) {
          throw new Error(
            `Missing mapping for ${serverlessFunctionId}:${serverlessFunctionVersion}`,
          );
        }

        return newId;
      };

      for (const version of workflowVersions) {
        const { migratedSteps, hasChanges } =
          migrateWorkflowCodeStepsWithMapping(
            version.steps,
            serverlessToLogicMapping,
          );

        if (!hasChanges) {
          continue;
        }

        await workflowVersionRepository.update(
          { id: version.id },
          { steps: migratedSteps },
        );

        this.logger.log(
          `Migrated workflow version ${version.id} in workspace ${workspaceId}`,
        );
      }
    } else {
      this.logger.log(
        `[DRY RUN] Would create ${targetsList.length} new logic function(s), migrate files, update workflow steps, and delete ${new Set(targetsList.map((t) => t.serverlessFunctionId)).size} old logic function(s) in workspace ${workspaceId}`,
      );
    }
  }

  private async getApplicationUniversalIdentifier(
    applicationId: string,
  ): Promise<string | null> {
    const application = await this.applicationService.findById(applicationId);

    return application?.universalIdentifier ?? null;
  }

  private async createLogicFunctionAndMigrateFiles(
    workspaceId: string,
    target: CodeStepMigrationTarget,
  ): Promise<string | null> {
    const { serverlessFunctionId, serverlessFunctionVersion } = target;
    const version = serverlessFunctionVersion ?? 'draft';

    const oldLogicFunction = await this.logicFunctionRepository.findOne({
      where: { id: serverlessFunctionId, workspaceId },
    });

    if (!isDefined(oldLogicFunction)) {
      this.logger.warn(
        `Logic function ${serverlessFunctionId} not found in workspace ${workspaceId}, skipping`,
      );

      return null;
    }

    const newLogicFunctionId = v4();
    const applicationUniversalIdentifier =
      await this.getApplicationUniversalIdentifier(
        oldLogicFunction.applicationId,
      );

    const { builtContent, sourceContent } = await this.readOldFunctionFiles(
      workspaceId,
      serverlessFunctionId,
      version,
    );

    const checksum = crypto
      .createHash('md5')
      .update(builtContent)
      .digest('hex');

    if (isDefined(applicationUniversalIdentifier)) {
      await this.uploadFunctionFiles(
        workspaceId,
        applicationUniversalIdentifier,
        newLogicFunctionId,
        { builtContent, sourceContent },
      );
    }

    await this.logicFunctionMetadataService.createOne({
      input: {
        id: newLogicFunctionId,
        name: oldLogicFunction.name,
        description: oldLogicFunction.description ?? undefined,
        timeoutSeconds: oldLogicFunction.timeoutSeconds ?? 300,
        toolInputSchema: oldLogicFunction.toolInputSchema ?? {},
        isTool: oldLogicFunction.isTool ?? false,
        handlerName: oldLogicFunction.handlerName,
        sourceHandlerPath: `${NEW_WORKFLOW_RESOURCE_PREFIX}/${newLogicFunctionId}/src/index.ts`,
        builtHandlerPath: `${NEW_WORKFLOW_RESOURCE_PREFIX}/${newLogicFunctionId}/src/index.mjs`,
        checksum,
        isBuildUpToDate: true,
      },
      workspaceId,
      ownerFlatApplication: oldLogicFunction.application,
    });

    this.logger.log(
      `Created logic function ${newLogicFunctionId} (from ${serverlessFunctionId}/${version}) and migrated files in workspace ${workspaceId}`,
    );

    return newLogicFunctionId;
  }

  private async readOldFunctionFiles(
    workspaceId: string,
    serverlessFunctionId: string,
    version: string,
  ): Promise<{ builtContent: string; sourceContent: string }> {
    const workspacePrefix = `workspace-${workspaceId}`;

    const builtSources = await this.fileStorageService.readFolderLegacy(
      `${workspacePrefix}/${OLD_BUILT_FOLDER}/${serverlessFunctionId}/${version}`,
    );

    const sourceSources = await this.fileStorageService.readFolderLegacy(
      `${workspacePrefix}/${OLD_SOURCE_FOLDER}/${serverlessFunctionId}/${version}`,
    );

    // Old source layout may nest files under a `src/` key
    const sourceRoot =
      (sourceSources.src as Sources) ?? (sourceSources as Sources);

    const builtContent = builtSources['index.mjs'] as string;
    const sourceContent = sourceRoot['index.ts'] as string;

    if (!isDefined(builtContent) || !isDefined(sourceContent)) {
      throw new Error(
        `Missing index.mjs or index.ts for serverless function ${serverlessFunctionId}/${version} in workspace ${workspaceId}`,
      );
    }

    return { builtContent, sourceContent };
  }

  private async uploadFunctionFiles(
    workspaceId: string,
    applicationUniversalIdentifier: string,
    newLogicFunctionId: string,
    files: { builtContent: string; sourceContent: string },
  ): Promise<void> {
    const resourcePath = `${NEW_WORKFLOW_RESOURCE_PREFIX}/${newLogicFunctionId}/src`;

    await this.fileStorageService.writeFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: `${resourcePath}/index.mjs`,
      sourceFile: Buffer.from(files.builtContent),
      mimeType: 'application/javascript',
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    await this.fileStorageService.writeFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: `${resourcePath}/index.ts`,
      sourceFile: Buffer.from(files.sourceContent),
      mimeType: 'application/typescript',
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });
  }
}
