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
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

type CustomViewMetadata = {
  viewEntity: ViewEntity;
  fromStandard: boolean;
};

type StandardViewMetadata = {
  viewEntity: ViewEntity;
  universalIdentifier: string;
};

type AllWarnings = 'unknown_view_name' | 'unknown_object';

type ViewMetadataWarning = {
  viewEntity: ViewEntity;
  warning: AllWarnings;
  objectNameSingular?: string;
};

type AllExceptions = 'existing_universal_id_mismatch' | 'not_found_object';

type ViewMetadataException = {
  viewEntity: ViewEntity;
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
      WorkspaceActivationStatus.PENDING_CREATION,
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

    const allViewEntities = await this.viewRepository.find({
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
    });

    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const customViewMetadataEntities: CustomViewMetadata[] = [];
    const standardViewMetadataEntities: StandardViewMetadata[] = [];
    const warnings: ViewMetadataWarning[] = [];
    const exceptions: ViewMetadataException[] = [];

    for (const viewEntity of allViewEntities) {
      // TODO double check that index view are not custom clearly not sure sure about that
      if (viewEntity.isCustom) {
        customViewMetadataEntities.push({
          viewEntity,
          fromStandard: false,
        });

        continue;
      }

      const flatObjectMetadata =
        flatObjectMetadataMaps.byId[viewEntity.objectMetadataId];

      if (!isDefined(flatObjectMetadata)) {
        exceptions.push({
          viewEntity,
          exception: 'not_found_object',
        });
        continue;
      }

      const objectConfig =
        STANDARD_OBJECTS[
          flatObjectMetadata.nameSingular as keyof typeof STANDARD_OBJECTS
        ];

      if (!isDefined(objectConfig)) {
        warnings.push({
          viewEntity,
          warning: 'unknown_object',
          objectNameSingular: flatObjectMetadata.nameSingular,
        });
        customViewMetadataEntities.push({
          viewEntity,
          fromStandard: true,
        });
        continue;
      }

      const objectViews =
        'views' in objectConfig
          ? (objectConfig.views as Record<
              string,
              { universalIdentifier: string } | undefined
            >)
          : null;

      if (!isDefined(objectViews)) {
        warnings.push({
          viewEntity,
          warning: 'unknown_object',
          objectNameSingular: flatObjectMetadata.nameSingular,
        });
        customViewMetadataEntities.push({
          viewEntity,
          fromStandard: true,
        });
        continue;
      }

      const viewConfig = objectViews[viewEntity.name];
      const universalIdentifier = viewConfig?.universalIdentifier;

      if (!isDefined(universalIdentifier)) {
        warnings.push({
          viewEntity,
          warning: 'unknown_view_name',
          objectNameSingular: flatObjectMetadata.nameSingular,
        });
        customViewMetadataEntities.push({
          viewEntity,
          fromStandard: true,
        });
        continue;
      }

      if (
        isDefined(viewEntity.universalIdentifier) &&
        viewEntity.universalIdentifier !== universalIdentifier
      ) {
        exceptions.push({
          viewEntity,
          exception: 'existing_universal_id_mismatch',
        });
        continue;
      }

      standardViewMetadataEntities.push({
        viewEntity,
        universalIdentifier:
          viewEntity.universalIdentifier ?? universalIdentifier,
      });
    }

    const totalUpdates =
      customViewMetadataEntities.length + standardViewMetadataEntities.length;

    if (warnings.length > 0) {
      this.logger.warn(
        `Found ${warnings.length} warning(s) while processing view metadata for workspace ${workspaceId}. These views will become custom.`,
      );

      for (const { viewEntity, warning, objectNameSingular } of warnings) {
        this.logger.warn(
          `Warning for view "${viewEntity.name}" on object "${objectNameSingular ?? 'unknown'}" (id=${viewEntity.id}): ${warning}`,
        );
      }
    }

    if (exceptions.length > 0) {
      this.logger.error(
        `Found ${exceptions.length} exception(s) while processing view metadata for workspace ${workspaceId}. No updates will be applied.`,
      );

      for (const { viewEntity, exception, objectNameSingular } of exceptions) {
        this.logger.error(
          `Exception for view "${viewEntity.name}" on object "${objectNameSingular ?? 'unknown'}" (id=${viewEntity.id}): ${exception}`,
        );
      }

      throw new Error(
        `Aborting migration for workspace ${workspaceId} due to ${exceptions.length} exception(s). See logs above for details.`,
      );
    }

    this.logger.log(
      `Successfully validated ${totalUpdates}/${allViewEntities.length} view metadata update(s) for workspace ${workspaceId} (${customViewMetadataEntities.length} custom, ${standardViewMetadataEntities.length} standard)`,
    );

    if (!options.dryRun) {
      const customUpdates = customViewMetadataEntities.map(
        ({ viewEntity }) => ({
          id: viewEntity.id,
          universalIdentifier: viewEntity.universalIdentifier ?? v4(),
          applicationId: workspaceCustomFlatApplication.id,
        }),
      );

      const standardUpdates = standardViewMetadataEntities.map(
        ({ viewEntity, universalIdentifier }) => ({
          id: viewEntity.id,
          universalIdentifier,
          applicationId: twentyStandardFlatApplication.id,
        }),
      );

      await this.viewRepository.save([...customUpdates, ...standardUpdates]);

      const relatedMetadataNames = getMetadataRelatedMetadataNames('view');
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
        `Applied ${totalUpdates} view metadata update(s) for workspace ${workspaceId}`,
      );
    } else {
      this.logger.log(
        `Dry run: would apply ${totalUpdates} view metadata update(s) for workspace ${workspaceId}`,
      );
    }
  }
}
