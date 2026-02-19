import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getSubFlatEntityMapsByApplicationIdsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-application-ids-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Command({
  name: 'upgrade:1-19:backfill-message-channel-message-association-message-folder',
  description:
    'Backfill messageChannelMessageAssociationMessageFolder standard object and its relation fields',
})
export class BackfillMessageChannelMessageAssociationMessageFolderCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  private addNewEntitiesToFlatEntityMaps<T extends SyncableFlatEntity>({
    fromMaps,
    standardBuilderMaps,
  }: {
    fromMaps: FlatEntityMaps<T>;
    standardBuilderMaps: FlatEntityMaps<T>;
  }): FlatEntityMaps<T> {
    let toMaps = fromMaps;

    for (const [universalIdentifier, entity] of Object.entries(
      standardBuilderMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(entity) ||
        isDefined(fromMaps.byUniversalIdentifier[universalIdentifier])
      ) {
        continue;
      }

      toMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: entity,
        flatEntityMaps: toMaps,
      });
    }

    return toMaps;
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting backfill of messageChannelMessageAssociationMessageFolder for workspace ${workspaceId}`,
    );

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'featureFlagsMap',
      ]);

    const existingObject = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.messageChannelMessageAssociationMessageFolder
          .universalIdentifier,
    });

    if (existingObject) {
      this.logger.log(
        `messageChannelMessageAssociationMessageFolder object already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create messageChannelMessageAssociationMessageFolder object and relation fields for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const fromFlatObjectMetadataMaps =
      getSubFlatEntityMapsByApplicationIdsOrThrow<FlatObjectMetadata>({
        applicationIds: [twentyStandardFlatApplication.id],
        flatEntityMaps: flatObjectMetadataMaps,
      });

    const fromFlatFieldMetadataMaps =
      getSubFlatEntityMapsByApplicationIdsOrThrow<FlatFieldMetadata>({
        applicationIds: [twentyStandardFlatApplication.id],
        flatEntityMaps: flatFieldMetadataMaps,
      });

    const {
      allFlatEntityMaps: standardAllFlatEntityMaps,
      idByUniversalIdentifierByMetadataName,
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
    });

    const toFlatObjectMetadataMaps =
      this.addNewEntitiesToFlatEntityMaps<FlatObjectMetadata>({
        fromMaps: fromFlatObjectMetadataMaps,
        standardBuilderMaps: standardAllFlatEntityMaps.flatObjectMetadataMaps,
      });

    const toFlatFieldMetadataMaps =
      this.addNewEntitiesToFlatEntityMaps<FlatFieldMetadata>({
        fromMaps: fromFlatFieldMetadataMaps,
        standardBuilderMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          buildOptions: {
            isSystemBuild: true,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
          },
          fromToAllFlatEntityMaps: {
            flatObjectMetadataMaps: {
              from: fromFlatObjectMetadataMaps,
              to: toFlatObjectMetadataMaps,
            },
            flatFieldMetadataMaps: {
              from: fromFlatFieldMetadataMaps,
              to: toFlatFieldMetadataMaps,
            },
          },
          workspaceId,
          additionalCacheDataMaps: {
            featureFlagsMap,
          },

          idByUniversalIdentifierByMetadataName,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      this.logger.error(
        `Failed to create messageChannelMessageAssociationMessageFolder:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
      throw new Error(
        `Failed to create messageChannelMessageAssociationMessageFolder for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully created messageChannelMessageAssociationMessageFolder for workspace ${workspaceId}`,
    );
  }
}
