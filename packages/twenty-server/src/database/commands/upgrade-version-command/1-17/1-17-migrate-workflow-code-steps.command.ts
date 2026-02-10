import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as fs from 'fs/promises';
import { dirname, join } from 'path';

import { Command } from 'nest-commander';
import { FileFolder, type Sources } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';
import { isObject } from 'class-validator';
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

    const tempRoot = await this.migrateFilesFromOldPathToTemp(
      workspaceId,
      serverlessFunctionId,
      version,
    );

    const newLogicFunctionId = v4();
    const applicationUniversalIdentifier =
      await this.getApplicationUniversalIdentifier(
        oldLogicFunction.applicationId,
      );

    if (isDefined(applicationUniversalIdentifier)) {
      await this.uploadTempToNewPath(
        workspaceId,
        applicationUniversalIdentifier,
        newLogicFunctionId,
        tempRoot,
      );
    }

    await this.logicFunctionMetadataService.createOne({
      input: {
        id: newLogicFunctionId,
        name: oldLogicFunction.name,
        description: oldLogicFunction.description ?? undefined,
        timeoutSeconds: oldLogicFunction.timeoutSeconds ?? 300,
        toolInputSchema: oldLogicFunction.toolInputSchema ?? undefined,
        isTool: oldLogicFunction.isTool ?? false,
        sourceHandlerPath: `${NEW_WORKFLOW_RESOURCE_PREFIX}/${newLogicFunctionId}/src/index.ts`,
        builtHandlerPath: `${NEW_WORKFLOW_RESOURCE_PREFIX}/${newLogicFunctionId}/src/index.mjs`,
        handlerName: oldLogicFunction.handlerName,
        checksum: oldLogicFunction.checksum ?? 'temporary',
      },
      workspaceId,
      ownerFlatApplication: oldLogicFunction.application,
    });

    await fs.rm(tempRoot, { recursive: true, force: true });

    this.logger.log(
      `Created logic function ${newLogicFunctionId} (from ${serverlessFunctionId}/${version}) and migrated files in workspace ${workspaceId}`,
    );

    return newLogicFunctionId;
  }

  private async migrateFilesFromOldPathToTemp(
    workspaceId: string,
    serverlessFunctionId: string,
    version: string,
  ): Promise<string> {
    const workspacePrefix = `workspace-${workspaceId}`;
    const oldPaths = {
      built: `${workspacePrefix}/${OLD_BUILT_FOLDER}/${serverlessFunctionId}/${version}`,
      source: `${workspacePrefix}/${OLD_SOURCE_FOLDER}/${serverlessFunctionId}/${version}`,
    };

    const tempRoot = await fs.mkdtemp(
      `/tmp/twenty-migrate-code-step-${workspaceId}-${serverlessFunctionId}-${version}-`,
    );
    const builtTempDir = join(tempRoot, 'built');
    const sourceTempDir = join(tempRoot, 'source');

    await fs.mkdir(builtTempDir, { recursive: true });
    await fs.mkdir(sourceTempDir, { recursive: true });

    const builtSources = await this.fileStorageService.readFolderLegacy(
      oldPaths.built,
    );

    await this.writeSourcesToLocalFolder(builtSources as Sources, builtTempDir);

    const sourceSources = await this.fileStorageService.readFolderLegacy(
      oldPaths.source,
    );
    const flattened =
      (sourceSources.src as Sources) ?? (sourceSources as Sources);

    await this.writeSourcesToLocalFolder(flattened, sourceTempDir);

    return tempRoot;
  }

  private async uploadTempToNewPath(
    workspaceId: string,
    applicationUniversalIdentifier: string,
    newLogicFunctionId: string,
    tempRoot: string,
  ): Promise<void> {
    const resourcePath = `${NEW_WORKFLOW_RESOURCE_PREFIX}/${newLogicFunctionId}/src`;
    const builtTempDir = join(tempRoot, 'built');
    const sourceTempDir = join(tempRoot, 'source');

    const builtFile = await fs.readFile(join(builtTempDir, 'index.mjs'));
    const sourceFile = await fs.readFile(join(sourceTempDir, 'index.ts'));

    await this.fileStorageService.writeFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: `${resourcePath}/index.mjs`,
      sourceFile: builtFile,
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
      sourceFile: sourceFile,
      mimeType: 'application/typescript',
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });
  }

  private async writeSourcesToLocalFolder(
    sources: Sources,
    localPath: string,
  ): Promise<void> {
    for (const key of Object.keys(sources)) {
      const filePath = join(localPath, key);
      const value = sources[key];

      if (isObject(value)) {
        await this.writeSourcesToLocalFolder(value as Sources, filePath);
        continue;
      }
      await fs.mkdir(dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, value);
    }
  }
}
