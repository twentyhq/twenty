import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

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

    const applicationRepository =
      this.coreDataSource.getRepository(ApplicationEntity);
    const applications = await applicationRepository.find({
      where: { workspaceId },
      select: [
        'id',
        'universalIdentifier',
        'workspaceId',
        'packageJsonFileId',
        'yarnLockFileId',
        'logicFunctionLayerId',
      ],
    });

    for (const application of applications) {
      const needsDefaultBackfill =
        (application.id === twentyStandardFlatApplication.id ||
          application.id === workspaceCustomFlatApplication.id) &&
        (application.packageJsonFileId === null ||
          application.packageJsonFileId === undefined);

      if (needsDefaultBackfill) {
        this.logger.log(
          `Backfilling standard/custom application ${application.id} with default package files`,
        );

        if (!dryRun) {
          const fullApplication = await applicationRepository.findOneOrFail({
            where: { id: application.id },
            relations: ['packageJsonFile', 'yarnLockFile'],
          });

          await this.applicationService.uploadDefaultPackageFilesAndSetFileIds(
            fullApplication,
          );
        }

        continue;
      }

      const needsLayerBackfill =
        isDefined(application.logicFunctionLayerId) &&
        (application.packageJsonFileId === null ||
          application.packageJsonFileId === undefined);

      if (needsLayerBackfill) {
        this.logger.log(
          `Backfilling application ${application.id} from logic function layer ${application.logicFunctionLayerId}`,
        );

        if (!dryRun) {
          await this.backfillApplicationFromLogicFunctionLayer(application);
        }
      }
    }
  }

  private async backfillApplicationFromLogicFunctionLayer(
    application: Pick<
      ApplicationEntity,
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
      select: [
        'id',
        'packageJson',
        'yarnLock',
        'packageJsonChecksum',
        'yarnLockChecksum',
        'availablePackages',
      ],
    });

    if (!isDefined(layer)) {
      this.logger.warn(
        `Logic function layer ${application.logicFunctionLayerId} not found for application ${application.id}, skipping`,
      );

      return;
    }

    const packageJsonContent = JSON.stringify(layer.packageJson, null, 2);

    const packageJsonFile = await this.fileStorageService.writeFile_v2({
      sourceFile: packageJsonContent,
      mimeType: undefined,
      fileFolder: FileFolder.Dependencies,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId: application.workspaceId,
      resourcePath: 'package.json',
      settings: { isTemporaryFile: false, toDelete: false },
    });

    const yarnLockFile = await this.fileStorageService.writeFile_v2({
      sourceFile: layer.yarnLock,
      mimeType: undefined,
      fileFolder: FileFolder.Dependencies,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId: application.workspaceId,
      resourcePath: 'yarn.lock',
      settings: { isTemporaryFile: false, toDelete: false },
    });

    await this.applicationService.update(application.id, {
      packageJsonFileId: packageJsonFile.id,
      yarnLockFileId: yarnLockFile.id,
      packageJsonChecksum: layer.packageJsonChecksum ?? null,
      yarnLockChecksum: layer.yarnLockChecksum,
      availablePackages: layer.availablePackages ?? {},
      workspaceId: application.workspaceId,
    });
  }
}
