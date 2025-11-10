import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, IsNull, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ALL_METADATA_ENTITY_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-entity-by-metadata-name.constant';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  ALL_METADATA_NAME,
  AllMetadataName,
  NOT_V2_YET_METADATA_NAME,
  NotV2YetAllMetadataName,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

const ALL_METADATA_NAME_TO_MIGRATE = [
  ...Object.keys(ALL_METADATA_NAME),
  ...Object.keys(NOT_V2_YET_METADATA_NAME),
] as (AllMetadataName | NotV2YetAllMetadataName)[];

@Command({
  name: 'upgrade:1-11:associate-custom-entities-to-workspace-custom-application',
  description:
    'Will scan all workspace custom entities and associate it to the workspace-custom app and set a universal identifier',
})
export class AssociateCustomEntitiesToWorkspaceCustomApplicationCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    if (!isDefined(workspace)) {
      throw new Error(`Could not find workspace ${workspaceId}`);
    }

    this.logger.log(
      `associate-custom-entities-to-custom-workspace-application start ${workspaceId}`,
    );

    const workspaceCustomApplication = await this.applicationService.findById(
      workspace.workspaceCustomApplicationId,
    );

    if (!isDefined(workspaceCustomApplication)) {
      throw new Error(
        `Could not find workspace-custom application workspaceId=${workspaceId} applicationId=${workspace.workspaceCustomApplicationId}`,
      );
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const metadataName of ALL_METADATA_NAME_TO_MIGRATE) {
        const currentMetadataEntity =
          ALL_METADATA_ENTITY_BY_METADATA_NAME[metadataName];

        const metadataEntityRepository = queryRunner.manager.getRepository(
          currentMetadataEntity,
        );
        this.logger.log(`retrieving ${metadataName} entities`);

        const customEntities = await metadataEntityRepository.find({
          select: {
            id: true,
            universalIdentifier: true,
            applicationId: true,
          },
          where: {
            workspaceId,
            applicationId: IsNull(),
          },
          withDeleted: true,
        });

        for (const entity of customEntities) {
          this.logger.log(`Processing entity id=${entity.id}`);

          await metadataEntityRepository.update(entity.id, {
            universalIdentifier: entity.universalIdentifier ?? v4(),
            applicationId: workspaceCustomApplication.id,
          });
        }
      }

      if (!options.dryRun) {
        await queryRunner.commitTransaction();
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
