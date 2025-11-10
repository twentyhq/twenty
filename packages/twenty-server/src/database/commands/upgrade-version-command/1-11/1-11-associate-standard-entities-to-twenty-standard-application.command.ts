import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, IsNull, Not, Or, Repository } from 'typeorm';
import {
  ALL_METADATA_NAME,
  AllMetadataName,
  NOT_V2_YET_METADATA_NAME,
  NotV2YetAllMetadataName,
} from 'twenty-shared/metadata';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getAllTransactionalMetadataEntityRepository } from 'src/engine/metadata-modules/flat-entity/utils/get-all-transactional-metadata-entity-repository.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';

const ALL_METADATA_NAME_TO_MIGRATE = [
  ...Object.keys(ALL_METADATA_NAME),
  ...Object.keys(NOT_V2_YET_METADATA_NAME),
] as (AllMetadataName | NotV2YetAllMetadataName)[];

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
    options,
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

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const metadataEntityRepositoryByMetadataName =
      getAllTransactionalMetadataEntityRepository({
        queryRunner,
      });

    try {
      for (const metadataName of ALL_METADATA_NAME_TO_MIGRATE) {
        this.logger.log(`retrieving ${metadataName} entities`);

        try {
          switch (metadataName) {
            case 'agent':
            case 'role':
            case 'objectMetadata': {
              const metadataEntityRepository =
                metadataEntityRepositoryByMetadataName[metadataName];

              const standardEntities = await metadataEntityRepository.find({
                select: {
                  standardId: true,
                  universalIdentifier: true,
                  applicationId: true,
                  id: true,
                },
                where: {
                  standardId: Not(IsNull()),
                  workspaceId,
                  applicationId: IsNull(),
                },
                withDeleted: true,
              });

              for (const entity of standardEntities) {
                this.logger.log(
                  `Processing entity id=${entity.id} standardId=${entity.standardId}`,
                );

                await metadataEntityRepository.update(entity.id, {
                  universalIdentifier:
                    entity.universalIdentifier ?? entity.standardId,
                  applicationId: twentyStandardApplication.id,
                });
              }
              break;
            }
            case 'view':
            case 'fieldMetadata':
            case 'index': {
              const metadataEntityRepository =
                metadataEntityRepositoryByMetadataName[metadataName];

              const standardEntities = await metadataEntityRepository.find({
                select: {
                  id: true,
                  universalIdentifier: true,
                  applicationId: true,
                },
                where: {
                  workspaceId,
                  applicationId: IsNull(),
                  isCustom: Or(IsNull(), false as any),
                },
                withDeleted: true,
              });

              for (const entity of standardEntities) {
                this.logger.log(`Processing entity id=${entity.id}`);

                await metadataEntityRepository.update(entity.id, {
                  universalIdentifier: entity.universalIdentifier ?? v4(),
                  applicationId: twentyStandardApplication.id,
                });
              }
              break;
            }
            case 'viewField':
            case 'viewFilter':
            case 'viewFilterGroup':
            case 'viewSort':
            case 'viewGroup': {
              const metadataEntityRepository =
                metadataEntityRepositoryByMetadataName[metadataName];

              const standardEntities = await metadataEntityRepository.find({
                select: {
                  id: true,
                  universalIdentifier: true,
                  applicationId: true,
                },
                where: {
                  view: {
                    isCustom: Or(IsNull(), false as any),
                  },
                  workspaceId,
                  applicationId: IsNull(),
                },
                withDeleted: true,
              });

              for (const entity of standardEntities) {
                this.logger.log(`Processing entity id=${entity.id}`);

                await metadataEntityRepository.update(entity.id, {
                  universalIdentifier: entity.universalIdentifier ?? v4(),
                  applicationId: twentyStandardApplication.id,
                });
              }
              break;
            }
            case 'serverlessFunction':
            case 'cronTrigger':
            case 'databaseEventTrigger':
            case 'routeTrigger': {
              // No twnenty-standards entries only custom
              break;
            }
            default: {
              assertUnreachable(metadataName);
            }
          }
        } catch (error) {
          this.logger.error(`Failed to iterate over ${metadataName}`);
          throw error;
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
