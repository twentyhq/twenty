import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { capitalize, isDefined, uncapitalize } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  RunOnWorkspaceArgs,
  WorkspacesMigrationCommandRunner,
} from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ALL_ENTITY_VIEW_NAME } from 'src/database/commands/upgrade-version-command/1-16/utils/compute-formatted-view-name.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

type StandardViewUpdate = {
  flatView: FlatView;
  universalIdentifier: string;
  objectNameSingular: string;
};

type AllExceptions = 'unknown_standard_view';

type ViewMetadataException = {
  flatView: FlatView;
  exception: AllExceptions;
  objectNameSingular?: string;
};

@Command({
  name: 'upgrade:1-16:identify-view-metadata',
  description: 'Identify standard view metadata',
})
export class IdentifyViewMetadataCommand extends WorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly applicationService: ApplicationService,
    protected readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService, [
      WorkspaceActivationStatus.ACTIVE,
      WorkspaceActivationStatus.SUSPENDED,
      WorkspaceActivationStatus.ONGOING_CREATION,
    ]);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running identify standard view metadata for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatObjectMetadataMaps, flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatViewMaps'],
        },
      );

    await this.identifyStandardViewsOrThrow({
      workspaceId,
      flatObjectMetadataMaps,
      flatViewMaps,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    await this.identifyCustomViews({
      workspaceId,
      flatObjectMetadataMaps,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    const relatedMetadataNames = getMetadataRelatedMetadataNames('view');
    const relatedCacheKeysToInvalidate = relatedMetadataNames.map(
      getMetadataFlatEntityMapsKey,
    );

    this.logger.log(
      `Invalidating caches: ${relatedCacheKeysToInvalidate.join(' ')}`,
    );
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatViewMaps',
      ...relatedCacheKeysToInvalidate,
    ]);
  }

  private async identifyStandardViewsOrThrow({
    workspaceId,
    flatObjectMetadataMaps,
    flatViewMaps,
    twentyStandardApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatViewMaps: FlatEntityMaps<FlatView>;
    twentyStandardApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const standardViewUpdates: StandardViewUpdate[] = [];
    const exceptions: ViewMetadataException[] = [];

    for (const [objectNameSingular, objectConfig] of Object.entries(
      STANDARD_OBJECTS,
    )) {
      const objectViews =
        'views' in objectConfig
          ? (objectConfig.views as Record<
              string,
              { universalIdentifier: string } | undefined
            >)
          : null;

      if (!isDefined(objectViews)) {
        continue;
      }
      const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: objectConfig.universalIdentifier,
      });

      if (!isDefined(flatObjectMetadata)) {
        this.logger.error(
          `Standard object "${objectNameSingular}" not found in workspace, this needs investigation, skipping`,
        );
        continue;
      }

      const relatedFlatViews = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityIds: flatObjectMetadata.viewIds,
        flatEntityMaps: flatViewMaps,
      });

      for (const flatView of relatedFlatViews) {
        if (isDefined(flatView.applicationId)) {
          continue;
        }

        // INDEX views -> forward to standard (if object has views config)
        if (
          flatView.key === ViewKey.INDEX &&
          flatView.name === ALL_ENTITY_VIEW_NAME
        ) {
          const formattedViewName = `all${capitalize(flatObjectMetadata.namePlural)}`;

          const viewConfig = objectViews[formattedViewName];
          const universalIdentifier = viewConfig?.universalIdentifier;

          if (!isDefined(universalIdentifier)) {
            exceptions.push({
              exception: 'unknown_standard_view',
              flatView,
              objectNameSingular: flatObjectMetadata.nameSingular,
            });
            continue;
          }

          standardViewUpdates.push({
            flatView,
            universalIdentifier:
              flatView.universalIdentifier ?? universalIdentifier,
            objectNameSingular: flatObjectMetadata.nameSingular,
          });
          continue;
        }

        // Views with "All" name pattern but not INDEX -> forward to custom
        if (flatView.name.startsWith('All ')) {
          continue;
        }

        // Remaining views (like assignedToMe, byStatus, etc.)
        const formattedViewName = uncapitalize(
          flatView.name.split(' ').map(capitalize).join(''),
        );

        const viewConfig = objectViews[formattedViewName];
        const universalIdentifier = viewConfig?.universalIdentifier;

        if (!isDefined(universalIdentifier)) {
          continue;
        }

        standardViewUpdates.push({
          flatView,
          universalIdentifier:
            flatView.universalIdentifier ?? universalIdentifier,
          objectNameSingular: flatObjectMetadata.nameSingular,
        });
      }
    }

    if (exceptions.length > 0) {
      this.logger.error(
        `Found ${exceptions.length} exception(s) while processing view metadata for workspace ${workspaceId}. No updates will be applied.`,
      );

      for (const { flatView, exception, objectNameSingular } of exceptions) {
        this.logger.error(
          `Exception for view "${flatView.name}" on object "${objectNameSingular ?? 'unknown'}" (id=${flatView.id}): ${exception}`,
        );
      }

      throw new Error(
        `Aborting migration for workspace ${workspaceId} due to ${exceptions.length} exception(s). See logs above for details.`,
      );
    }

    const standardUpdates = standardViewUpdates.map(
      ({ flatView, universalIdentifier }) => ({
        id: flatView.id,
        universalIdentifier,
        applicationId: twentyStandardApplicationId,
      }),
    );

    this.logger.log(
      `Found ${standardUpdates.length} standard view(s) to update for workspace ${workspaceId}`,
    );

    for (const {
      flatView,
      universalIdentifier,
      objectNameSingular,
    } of standardViewUpdates) {
      this.logger.log(
        `  - Standard view "${flatView.name}" on object "${objectNameSingular}" (id=${flatView.id}) -> universalIdentifier=${universalIdentifier}`,
      );
    }

    if (!dryRun) {
      await this.viewRepository.save(standardUpdates);
    }
  }

  private async identifyCustomViews({
    workspaceId,
    flatObjectMetadataMaps,
    workspaceCustomApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    workspaceCustomApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const remainingCustomViews = await this.viewRepository.find({
      select: {
        id: true,
        universalIdentifier: true,
        applicationId: true,
        name: true,
        objectMetadataId: true,
        isCustom: true,
      },
      where: {
        workspaceId,
        applicationId: IsNull(),
      },
      withDeleted: true,
    });

    const customUpdates = remainingCustomViews.map((viewEntity) => ({
      id: viewEntity.id,
      universalIdentifier: viewEntity.universalIdentifier ?? v4(),
      applicationId: workspaceCustomApplicationId,
    }));

    this.logger.log(
      `Found ${customUpdates.length} custom view(s) to update for workspace ${workspaceId}`,
    );

    for (const viewEntity of remainingCustomViews) {
      const flatObjectMetadata =
        flatObjectMetadataMaps.byId[viewEntity.objectMetadataId];

      this.logger.log(
        `  - Custom view "${viewEntity.name}" on object "${flatObjectMetadata?.nameSingular ?? 'unknown'}" (id=${viewEntity.id})`,
      );
    }

    if (!dryRun) {
      await this.viewRepository.save(customUpdates);
    }
  }
}
