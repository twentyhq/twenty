import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  RunOnWorkspaceArgs,
  WorkspacesMigrationCommandRunner,
} from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

type CustomViewFieldMetadata = {
  viewFieldEntity: ViewFieldEntity;
  fromStandard: boolean;
};

type StandardViewFieldMetadata = {
  viewFieldEntity: ViewFieldEntity;
  universalIdentifier: string;
};

type AllWarnings = 'unknown_object' | 'unknown_view' | 'unknown_view_field';

type ViewFieldMetadataWarning = {
  viewFieldEntity: ViewFieldEntity;
  warning: AllWarnings;
};

type AllExceptions =
  | 'existing_universal_id_mismatch'
  | 'view_not_found'
  | 'object_not_found'
  | 'field_not_found';

type ViewFieldMetadataException = {
  viewFieldEntity: ViewFieldEntity;
  exception: AllExceptions;
};

@Command({
  name: 'upgrade:1-16:identify-view-field-metadata',
  description: 'Identify standard view field metadata',
})
export class IdentifyViewFieldMetadataCommand extends WorkspacesMigrationCommandRunner {
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
      `Running identify standard view field metadata for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const allViewFieldEntities = await this.viewFieldRepository.find({
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
    });

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
            'flatViewMaps',
          ],
        },
      );

    const customViewFieldMetadataEntities: CustomViewFieldMetadata[] = [];
    const standardViewFieldMetadataEntities: StandardViewFieldMetadata[] = [];
    const warnings: ViewFieldMetadataWarning[] = [];
    const exceptions: ViewFieldMetadataException[] = [];

    for (const viewFieldEntity of allViewFieldEntities) {
      const flatView = flatViewMaps.byId[viewFieldEntity.viewId];

      if (!isDefined(flatView)) {
        exceptions.push({
          viewFieldEntity,
          exception: 'view_not_found',
        });
        continue;
      }

      if (flatView.isCustom) {
        customViewFieldMetadataEntities.push({
          viewFieldEntity,
          fromStandard: false,
        });
        continue;
      }

      const flatObjectMetadata =
        flatObjectMetadataMaps.byId[flatView.objectMetadataId];

      if (!isDefined(flatObjectMetadata)) {
        exceptions.push({
          viewFieldEntity,
          exception: 'object_not_found',
        });
        continue;
      }

      const flatFieldMetadata =
        flatFieldMetadataMaps.byId[viewFieldEntity.fieldMetadataId];

      if (!isDefined(flatFieldMetadata)) {
        exceptions.push({
          viewFieldEntity,
          exception: 'field_not_found',
        });
        continue;
      }

      const objectConfig =
        STANDARD_OBJECTS[
          flatObjectMetadata.nameSingular as keyof typeof STANDARD_OBJECTS
        ];

      if (!isDefined(objectConfig)) {
        warnings.push({
          viewFieldEntity,
          warning: 'unknown_object',
        });
        customViewFieldMetadataEntities.push({
          viewFieldEntity,
          fromStandard: true,
        });
        continue;
      }

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
        warnings.push({
          viewFieldEntity,
          warning: 'unknown_object',
        });
        customViewFieldMetadataEntities.push({
          viewFieldEntity,
          fromStandard: true,
        });
        continue;
      }

      const viewConfig = objectViews[flatView.name];

      if (!isDefined(viewConfig) || !isDefined(viewConfig.viewFields)) {
        warnings.push({
          viewFieldEntity,
          warning: 'unknown_view',
        });
        customViewFieldMetadataEntities.push({
          viewFieldEntity,
          fromStandard: true,
        });
        continue;
      }

      const viewFieldConfig = viewConfig.viewFields[flatFieldMetadata.name];
      const universalIdentifier = viewFieldConfig?.universalIdentifier;

      if (!isDefined(universalIdentifier)) {
        warnings.push({
          viewFieldEntity,
          warning: 'unknown_view_field',
        });
        customViewFieldMetadataEntities.push({
          viewFieldEntity,
          fromStandard: true,
        });
        continue;
      }

      if (
        isDefined(viewFieldEntity.universalIdentifier) &&
        viewFieldEntity.universalIdentifier !== universalIdentifier
      ) {
        exceptions.push({
          viewFieldEntity,
          exception: 'existing_universal_id_mismatch',
        });
        continue;
      }

      standardViewFieldMetadataEntities.push({
        viewFieldEntity,
        universalIdentifier:
          viewFieldEntity.universalIdentifier ?? universalIdentifier,
      });
    }

    const totalUpdates =
      customViewFieldMetadataEntities.length +
      standardViewFieldMetadataEntities.length;

    if (warnings.length > 0) {
      this.logger.warn(
        `Found ${warnings.length} warning(s) while processing view field metadata for workspace ${workspaceId}. These view fields will become custom.`,
      );

      for (const { viewFieldEntity, warning } of warnings) {
        this.logger.warn(
          `Warning for view field (id=${viewFieldEntity.id}): ${warning}`,
        );
      }
    }

    if (exceptions.length > 0) {
      this.logger.error(
        `Found ${exceptions.length} exception(s) while processing view field metadata for workspace ${workspaceId}. No updates will be applied.`,
      );

      for (const { viewFieldEntity, exception } of exceptions) {
        this.logger.error(
          `Exception for view field (id=${viewFieldEntity.id}): ${exception}`,
        );
      }

      throw new Error(
        `Aborting migration for workspace ${workspaceId} due to ${exceptions.length} exception(s). See logs above for details.`,
      );
    }

    this.logger.log(
      `Successfully validated ${totalUpdates}/${allViewFieldEntities.length} view field metadata update(s) for workspace ${workspaceId} (${customViewFieldMetadataEntities.length} custom, ${standardViewFieldMetadataEntities.length} standard)`,
    );

    if (!options.dryRun) {
      const customUpdates = customViewFieldMetadataEntities.map(
        ({ viewFieldEntity }) => ({
          id: viewFieldEntity.id,
          universalIdentifier: viewFieldEntity.universalIdentifier ?? v4(),
          applicationId: workspaceCustomFlatApplication.id,
        }),
      );

      const standardUpdates = standardViewFieldMetadataEntities.map(
        ({ viewFieldEntity, universalIdentifier }) => ({
          id: viewFieldEntity.id,
          universalIdentifier,
          applicationId: twentyStandardFlatApplication.id,
        }),
      );

      await this.viewFieldRepository.save([
        ...customUpdates,
        ...standardUpdates,
      ]);

      const relatedMetadataNames = getMetadataRelatedMetadataNames('viewField');
      const cacheKeysToInvalidate = relatedMetadataNames.map(
        getMetadataFlatEntityMapsKey,
      );

      this.logger.log(
        `Invalidating caches: ${cacheKeysToInvalidate.join(' ')}`,
      );
      await this.workspaceCacheService.invalidateAndRecompute(
        workspaceId,
        cacheKeysToInvalidate,
      );

      this.logger.log(
        `Applied ${totalUpdates} view field metadata update(s) for workspace ${workspaceId}`,
      );
    } else {
      this.logger.log(
        `Dry run: would apply ${totalUpdates} view field metadata update(s) for workspace ${workspaceId}`,
      );
    }
  }
}
