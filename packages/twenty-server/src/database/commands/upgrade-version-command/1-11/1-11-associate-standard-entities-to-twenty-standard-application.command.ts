import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getAllMetadataEntityRepository } from 'src/engine/metadata-modules/flat-entity/utils/get-all-metadata-entity-repository.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';
import { ALL_METADATA_NAME, AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

@Command({
  name: 'upgrade:1-11:associate-standard-entities-to-twenty-standard-application',
  description:
    'Will scan all workspace standard entities and associate it to the twenty-standard app and set a universal identifier',
})
export class AssociateStandardEntitiesToTwentyStandardApplicationCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly applicationService: ApplicationService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource: workspaceDataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `associate-standard-entities-to-twenty-standard-application start ${workspaceId}`,
    );

    const twentyStandardApplication =
      await this.applicationService.findByUniversalIdentifier({
        universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
        workspaceId,
      });

    if (!isDefined(twentyStandardApplication)) {
      throw new Error(
        `Could not find workspace twenty-standard application ${workspaceId}`,
      );
    }

    const queryRunner = workspaceDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Could be move in constructor
    const metadataEntityRepositoryByMetadataName =
      getAllMetadataEntityRepository({
        dataSource: this.coreDataSource,
      });

    this.logger.log(`retrieved reposotiries`);

    try {
      for (const metadataName of Object.keys(
        ALL_METADATA_NAME,
      ) as AllMetadataName[]) {
        this.logger.log(`retrieving ${metadataName} entities`);
        const metadataEntityRepository =
          metadataEntityRepositoryByMetadataName[metadataName];

        const tmp = await metadataEntityRepository.count();
        this.logger.log(`${tmp} count`);
        // We should only be fetching non custom elements
        const allEntities = await metadataEntityRepository.find({
          select: {
            // standardId: true,
            id: true,
          },
          where: {
            workspaceId,
          },
          withDeleted: true,
        });

        this.logger.log(
          `About to iterate over ${allEntities.length} ${metadataName} entities`,
        );

        for (const entity of allEntities) {
          // @ts-expect-error TODO
          await metadataEntityRepository.update(entity.id, {
            applicationId: twentyStandardApplication.id,
          });
        }
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
