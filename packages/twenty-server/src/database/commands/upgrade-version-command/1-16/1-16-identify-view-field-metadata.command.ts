import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

type StandardViewFieldUpdate = {
  flatViewField: FlatViewField;
  universalIdentifier: string;
  objectNameSingular: string;
  viewName: string;
  fieldName: string;
};

type AllExceptions = 'unknown_standard_view_field';

type ViewFieldMetadataException = {
  flatViewField: FlatViewField;
  exception: AllExceptions;
  objectNameSingular: string;
  viewName: string;
  fieldName: string;
};

@Command({
  name: 'upgrade:1-16:identify-view-field-metadata',
  description: 'Identify standard view field metadata',
})
export class IdentifyViewFieldMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly applicationService: ApplicationService,
    protected readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running identify standard view field metadata for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
            'flatViewMaps',
            'flatViewFieldMaps',
          ],
        },
      );

    await this.identifyStandardViewFieldsOrThrow({
      workspaceId,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    await this.identifyCustomViewFields({
      workspaceId,
      flatObjectMetadataMaps,
      flatViewMaps,
      flatFieldMetadataMaps,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      dryRun: options.dryRun ?? false,
    });

    const relatedMetadataNames = getMetadataRelatedMetadataNames('viewField');
    const relatedCacheKeysToInvalidate = relatedMetadataNames.map(
      getMetadataFlatEntityMapsKey,
    );

    this.logger.log(
      `Invalidating caches: ${relatedCacheKeysToInvalidate.join(' ')}`,
    );
    if (!options.dryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatViewFieldMaps',
        ...relatedCacheKeysToInvalidate,
      ]);
    }
  }

  private async identifyStandardViewFieldsOrThrow({
    workspaceId,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatViewMaps,
    flatViewFieldMaps,
    twentyStandardApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatViewMaps: FlatEntityMaps<FlatView>;
    flatViewFieldMaps: FlatEntityMaps<FlatViewField>;
    twentyStandardApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const standardViewFieldUpdates: StandardViewFieldUpdate[] = [];
    const exceptions: ViewFieldMetadataException[] = [];

    for (const [objectNameSingular, objectConfig] of Object.entries(
      STANDARD_OBJECTS,
    )) {
      const objectViews =
        'views' in objectConfig
          ? (objectConfig.views as Record<
              string,
              | {
                  universalIdentifier: string;
                  viewFields?: Record<
                    string,
                    { universalIdentifier: string } | undefined
                  >;
                }
              | undefined
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

      // Iterate over view configs and find views by their universalIdentifier
      // (views have already been identified by the view identification command)
      for (const [viewName, viewConfig] of Object.entries(objectViews)) {
        if (!isDefined(viewConfig) || !isDefined(viewConfig.viewFields)) {
          continue;
        }

        const flatView = findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatViewMaps,
          universalIdentifier: viewConfig.universalIdentifier,
        });

        if (!isDefined(flatView)) {
          this.logger.warn(
            `Standard view "${viewName}" not found for object "${flatObjectMetadata.nameSingular}", skipping view fields`,
          );
          continue;
        }

        const relatedFlatViewFields =
          findManyFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityIds: flatView.viewFieldIds,
            flatEntityMaps: flatViewFieldMaps,
          });

        // Iterate over expected view fields from config
        for (const [fieldName, viewFieldConfig] of Object.entries(
          viewConfig.viewFields,
        )) {
          if (!isDefined(viewFieldConfig)) {
            continue;
          }

          const fieldUniversalIdentifier =
            objectConfig.fields[fieldName as keyof typeof objectConfig.fields]
              ?.universalIdentifier;

          if (!isDefined(fieldUniversalIdentifier)) {
            this.logger.warn(
              `Field "${fieldName}" config not found for object "${flatObjectMetadata.nameSingular}", skipping view field`,
            );
            continue;
          }

          const viewFieldUniversalIdentifier =
            viewConfig.viewFields[fieldName]?.universalIdentifier;

          if (!isDefined(viewFieldUniversalIdentifier)) {
            this.logger.warn(
              `View field for field "${fieldName}" config not found for object "${flatObjectMetadata.nameSingular}", skipping view field`,
            );
            continue;
          }

          // Find the field metadata by universal identifier
          const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatFieldMetadataMaps,
            universalIdentifier: fieldUniversalIdentifier,
          });

          if (!isDefined(flatFieldMetadata)) {
            this.logger.warn(
              `Field "${fieldName}" not found in workspace for object "${flatObjectMetadata.nameSingular}", skipping view field`,
            );
            continue;
          }

          // Find the existing view field that matches this field
          const matchingFlatViewField = relatedFlatViewFields.find(
            (viewField) => viewField.fieldMetadataId === flatFieldMetadata.id,
          );

          if (
            !isDefined(matchingFlatViewField) ||
            isDefined(matchingFlatViewField.applicationId)
          ) {
            continue;
          }

          standardViewFieldUpdates.push({
            flatViewField: matchingFlatViewField,
            universalIdentifier: viewFieldUniversalIdentifier,
            objectNameSingular: flatObjectMetadata.nameSingular,
            viewName: flatView.name,
            fieldName,
          });
        }
      }
    }

    if (exceptions.length > 0) {
      this.logger.error(
        `Found ${exceptions.length} exception(s) while processing view field metadata for workspace ${workspaceId}. No updates will be applied.`,
      );

      for (const {
        flatViewField,
        exception,
        objectNameSingular,
        viewName,
        fieldName,
      } of exceptions) {
        this.logger.error(
          `Exception for view field "${fieldName}" on view "${viewName}" of object "${objectNameSingular}" (id=${flatViewField.id}): ${exception}`,
        );
      }

      throw new Error(
        `Aborting migration for workspace ${workspaceId} due to ${exceptions.length} exception(s). See logs above for details.`,
      );
    }

    const standardUpdates = standardViewFieldUpdates.map(
      ({ flatViewField, universalIdentifier }) => ({
        id: flatViewField.id,
        universalIdentifier,
        applicationId: twentyStandardApplicationId,
      }),
    );

    this.logger.log(
      `Found ${standardUpdates.length} standard view field(s) to update for workspace ${workspaceId}`,
    );

    for (const {
      flatViewField,
      universalIdentifier,
      objectNameSingular,
      viewName,
      fieldName,
    } of standardViewFieldUpdates) {
      this.logger.log(
        `  - Standard view field "${fieldName}" on view "${viewName}" of object "${objectNameSingular}" (id=${flatViewField.id}) -> universalIdentifier=${universalIdentifier}`,
      );
    }

    if (!dryRun) {
      await this.viewFieldRepository.save(standardUpdates);
    }
  }

  private async identifyCustomViewFields({
    workspaceId,
    flatObjectMetadataMaps,
    flatViewMaps,
    flatFieldMetadataMaps,
    workspaceCustomApplicationId,
    dryRun,
  }: {
    workspaceId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatViewMaps: FlatEntityMaps<FlatView>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    workspaceCustomApplicationId: string;
    dryRun: boolean;
  }): Promise<void> {
    const remainingCustomViewFields = await this.viewFieldRepository.find({
      select: {
        id: true,
        universalIdentifier: true,
        applicationId: true,
        viewId: true,
        fieldMetadataId: true,
      },
      where: {
        workspaceId,
        applicationId: IsNull(),
      },
      withDeleted: true,
    });

    const customUpdates = remainingCustomViewFields.map((viewFieldEntity) => ({
      id: viewFieldEntity.id,
      universalIdentifier: viewFieldEntity.universalIdentifier ?? v4(),
      applicationId: workspaceCustomApplicationId,
    }));

    this.logger.log(
      `Found ${customUpdates.length} custom view field(s) to update for workspace ${workspaceId}`,
    );

    for (const viewFieldEntity of remainingCustomViewFields) {
      const flatView = flatViewMaps.byId[viewFieldEntity.viewId];
      const flatObjectMetadata = isDefined(flatView)
        ? flatObjectMetadataMaps.byId[flatView.objectMetadataId]
        : undefined;
      const flatFieldMetadata =
        flatFieldMetadataMaps.byId[viewFieldEntity.fieldMetadataId];

      this.logger.log(
        `  - Custom view field for field "${flatFieldMetadata?.name ?? 'unknown'}" on view "${flatView?.name ?? 'unknown'}" of object "${flatObjectMetadata?.nameSingular ?? 'unknown'}" (id=${viewFieldEntity.id})`,
      );
    }

    if (!dryRun) {
      await this.viewFieldRepository.save(customUpdates);
    }
  }
}
