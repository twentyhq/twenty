import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as fs from 'fs/promises';
import { join } from 'path';

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
import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

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
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
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

    const applicationUniversalIdentifier =
      await this.getApplicationUniversalIdentifier(
        oldLogicFunction.application.id,
      );

    if (!applicationUniversalIdentifier) {
      this.logger.warn(
        `Logic function ${serverlessFunctionId} application ${oldLogicFunction.application.id} not found not found in workspace ${workspaceId}, skipping`,
      );

      return null;
    }

    const newLogicFunctionId = v4();

    const { tempRoot, checksum } = await this.migrateFilesFromOldPathToTemp({
      workspaceId,
      applicationUniversalIdentifier,
      serverlessFunctionId,
      version,
    });

    await this.logicFunctionMetadataService.createOne({
      input: {
        name: oldLogicFunction.name,
        description: oldLogicFunction.description ?? undefined,
        timeoutSeconds: oldLogicFunction.timeoutSeconds ?? 300,
        toolInputSchema: oldLogicFunction.toolInputSchema ?? undefined,
        isTool: oldLogicFunction.isTool ?? false,
        handlerName: 'main',
        builtHandlerPath: 'src/index.mjs',
        sourceHandlerPath: 'src/index.ts',
        checksum,
        id: newLogicFunctionId,
      },
      workspaceId,
      ownerFlatApplication: oldLogicFunction.application,
    });

    if (isDefined(applicationUniversalIdentifier)) {
      await this.uploadTempToNewPath(
        workspaceId,
        applicationUniversalIdentifier,
        newLogicFunctionId,
        tempRoot,
      );
    }

    await fs.rm(tempRoot, { recursive: true, force: true });

    this.logger.log(
      `Created logic function ${newLogicFunctionId} (from ${serverlessFunctionId}/${version}) and migrated files in workspace ${workspaceId}`,
    );

    return newLogicFunctionId;
  }

  private async migrateFilesFromOldPathToTemp({
    workspaceId,
    applicationUniversalIdentifier,
    serverlessFunctionId,
    version,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    serverlessFunctionId: string;
    version: string;
  }): Promise<{ tempRoot: string; checksum: string }> {
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

    const builtContent = (
      await streamToBuffer(
        await this.fileStorageService.readFile({
          fileFolder: FileFolder.BuiltLogicFunction,
          resourcePath: 'src/index.mjs',
          workspaceId,
          applicationUniversalIdentifier,
        }),
      )
    ).toString('utf-8');

    const checksum = logicFunctionCreateHash(builtContent);

    await this.logicFunctionResourceService.writeSourcesToLocalFolder(
      builtSources as Sources,
      builtTempDir,
    );

    const sourceSources = await this.fileStorageService.readFolderLegacy(
      oldPaths.source,
    );
    const flattened =
      (sourceSources.src as Sources) ?? (sourceSources as Sources);

    await this.logicFunctionResourceService.writeSourcesToLocalFolder(
      flattened,
      sourceTempDir,
    );

    return { tempRoot, checksum };
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

    await this.fileStorageService.uploadFolder({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath,
      localPath: builtTempDir,
    });

    await this.fileStorageService.uploadFolder({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath,
      localPath: sourceTempDir,
    });
  }
}
