import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { parseAvailablePackagesFromPackageJsonAndYarnLock } from 'src/engine/core-modules/application/utils/parse-available-packages-from-package-json-and-yarn-lock.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileSettings } from 'src/engine/core-modules/file/types/file-settings.types';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Command({
  name: 'upgrade:1-17:backfill-application-package-files',
  description:
    'Backfill application package files: standard/custom apps get default files, other apps get files from logic function layer',
})
export class BackfillApplicationPackageFilesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly applicationService: ApplicationService,
    protected readonly fileStorageService: FileStorageService,
    protected readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running backfill application package files for workspace ${workspaceId}`,
    );

    const dryRun = options.dryRun ?? false;
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: ['id', 'workspaceCustomApplicationId'],
    });

    if (!isDefined(workspace)) {
      this.logger.warn(`Workspace ${workspaceId} not found, skipping`);

      return;
    }

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const flatApplications = Object.values(
      flatApplicationMaps.byId,
    ) as FlatApplication[];

    for (const application of flatApplications) {
      const isStandardOrCustomApplication =
        application.id === twentyStandardFlatApplication.id ||
        application.id === workspaceCustomFlatApplication.id;

      if (isStandardOrCustomApplication) {
        const needsBackfill =
          !isNonEmptyString(application.packageJsonFileId) ||
          !isNonEmptyString(application.yarnLockFileId) ||
          !isNonEmptyString(application.packageJsonChecksum) ||
          !isNonEmptyString(application.yarnLockChecksum) ||
          !isNonEmptyString(application.availablePackages);

        if (needsBackfill) {
          this.logger.log(
            `Backfilling standard/custom application ${application.id} with default package files`,
          );

          if (!dryRun) {
            await this.applicationService.uploadDefaultPackageFilesAndSetFileIds(
              application,
            );
          }
        } else {
          this.logger.log(
            `Skipping standard/custom application ${application.id} - already has package files`,
          );
        }

        continue;
      }

      const hasLogicFunctionLayer = isDefined(application.logicFunctionLayerId);
      const needsBackfill =
        !isNonEmptyString(application.packageJsonFileId) ||
        !isNonEmptyString(application.yarnLockFileId) ||
        !isNonEmptyString(application.packageJsonChecksum) ||
        !isNonEmptyString(application.yarnLockChecksum) ||
        !isNonEmptyString(application.availablePackages);

      if (!hasLogicFunctionLayer) {
        this.logger.log(
          `Skipping application ${application.id} - no logic function layer`,
        );

        continue;
      }

      if (!needsBackfill) {
        this.logger.log(
          `Skipping application ${application.id} - already has package files`,
        );

        continue;
      }

      this.logger.log(
        `Backfilling application ${application.id} from logic function layer ${application.logicFunctionLayerId}`,
      );

      if (!dryRun) {
        await this.backfillApplicationFromLogicFunctionLayer(application);
      }
    }
  }

  private async backfillApplicationFromLogicFunctionLayer(
    application: Pick<
      FlatApplication,
      'id' | 'universalIdentifier' | 'workspaceId' | 'logicFunctionLayerId'
    >,
  ): Promise<void> {
    const layerRepository = this.coreDataSource.getRepository(
      LogicFunctionLayerEntity,
    );
    const layer = await layerRepository.findOne({
      where: {
        id: application.logicFunctionLayerId as string,
        workspaceId: application.workspaceId,
      },
      select: ['id', 'packageJson', 'yarnLock'],
    });

    if (!isDefined(layer)) {
      this.logger.warn(
        `Logic function layer ${application.logicFunctionLayerId} not found for application ${application.id}, skipping`,
      );

      return;
    }

    const packageJsonContent = JSON.stringify(layer.packageJson, null, 2);
    const packageJsonChecksum = logicFunctionCreateHash(
      JSON.stringify(layer.packageJson),
    );
    const yarnLockChecksum = logicFunctionCreateHash(layer.yarnLock);
    const availablePackages = parseAvailablePackagesFromPackageJsonAndYarnLock(
      packageJsonContent,
      layer.yarnLock,
    );

    const dependencyFileSettings: FileSettings = {
      isTemporaryFile: false,
      toDelete: false,
    };

    const packageJsonFile = await this.fileStorageService.writeFile({
      sourceFile: packageJsonContent,
      mimeType: undefined,
      fileFolder: FileFolder.Dependencies,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId: application.workspaceId,
      resourcePath: 'package.json',
      settings: dependencyFileSettings,
    });

    const yarnLockFile = await this.fileStorageService.writeFile({
      sourceFile: layer.yarnLock,
      mimeType: undefined,
      fileFolder: FileFolder.Dependencies,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId: application.workspaceId,
      resourcePath: 'yarn.lock',
      settings: dependencyFileSettings,
    });

    await this.applicationService.update(application.id, {
      packageJsonFileId: packageJsonFile.id,
      yarnLockFileId: yarnLockFile.id,
      packageJsonChecksum,
      yarnLockChecksum,
      availablePackages,
      workspaceId: application.workspaceId,
    });
  }
}
