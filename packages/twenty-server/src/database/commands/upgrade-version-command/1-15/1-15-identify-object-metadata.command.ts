import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

type CustomObjectMetadata = {
  objectMetadataEntity: ObjectMetadataEntity;
  fromStandard: boolean;
};

type StandardObjectMetadata = {
  objectMetadataEntity: ObjectMetadataEntity;
  universalIdentifier: string;
};

type AllWarnings = 'unknown_standard_id';

type ObjectMetadataWarning = {
  objectMetadataEntity: ObjectMetadataEntity;
  warning: AllWarnings;
};

type AllExceptions = 'existing_universal_id_mismatch';

type ObjectMetadataException = {
  objectMetadataEntity: ObjectMetadataEntity;
  exception: AllExceptions;
};

// These standard object IDs are deprecated and should become custom
const DEPRECATED_STANDARD_OBJECT_IDS = [
  STANDARD_OBJECT_IDS.activity,
  STANDARD_OBJECT_IDS.activityTarget,
  STANDARD_OBJECT_IDS.comment,
  STANDARD_OBJECT_IDS.behavioralEvent,
  STANDARD_OBJECT_IDS.messageThreadSubscriber,
  STANDARD_OBJECT_IDS.workflowEventListener,
];

const STANDARD_IDS_THAT_MUST_BECOME_CUSTOM = [
  ...DEPRECATED_STANDARD_OBJECT_IDS,
] as string[];

@Command({
  name: 'upgrade:1-15:identify-object-metadata',
  description: 'Identify standard object metadata',
})
export class IdentifyObjectMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly applicationService: ApplicationService,
    protected readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running identify standard object metadata for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const allObjectMetadataEntities = await this.objectMetadataRepository.find({
      select: {
        id: true,
        universalIdentifier: true,
        applicationId: true,
        nameSingular: true,
        standardId: true,
        isCustom: true,
      },
      where: {
        workspaceId,
        applicationId: IsNull(),
      },
    });

    const customObjectMetadataEntities: CustomObjectMetadata[] = [];
    const standardObjectMetadataEntities: StandardObjectMetadata[] = [];
    const warnings: ObjectMetadataWarning[] = [];
    const exceptions: ObjectMetadataException[] = [];

    for (const objectMetadataEntity of allObjectMetadataEntities) {
      const shouldBecomeCustom =
        isDefined(objectMetadataEntity.standardId) &&
        STANDARD_IDS_THAT_MUST_BECOME_CUSTOM.includes(
          objectMetadataEntity.standardId,
        );
      const isStandardMetadataResult = isStandardMetadata(objectMetadataEntity);

      if (!isStandardMetadataResult || shouldBecomeCustom) {
        customObjectMetadataEntities.push({
          objectMetadataEntity,
          fromStandard: shouldBecomeCustom,
        });

        continue;
      }

      const objectConfig =
        STANDARD_OBJECTS[
          objectMetadataEntity.nameSingular as keyof typeof STANDARD_OBJECTS
        ];
      const universalIdentifier = objectConfig?.universalIdentifier;

      if (!isDefined(universalIdentifier)) {
        warnings.push({
          objectMetadataEntity,
          warning: 'unknown_standard_id',
        });
        customObjectMetadataEntities.push({
          objectMetadataEntity,
          fromStandard: true,
        });
        continue;
      }

      if (
        isDefined(objectMetadataEntity.universalIdentifier) &&
        objectMetadataEntity.universalIdentifier !== universalIdentifier
      ) {
        exceptions.push({
          objectMetadataEntity,
          exception: 'existing_universal_id_mismatch',
        });
        continue;
      }

      standardObjectMetadataEntities.push({
        objectMetadataEntity,
        universalIdentifier:
          objectMetadataEntity.universalIdentifier ?? universalIdentifier,
      });
    }

    const totalUpdates =
      customObjectMetadataEntities.length +
      standardObjectMetadataEntities.length;

    this.logger.log(
      `Successfully validated ${totalUpdates}/${allObjectMetadataEntities.length} object metadata update(s) for workspace ${workspaceId} (${customObjectMetadataEntities.length} custom, ${standardObjectMetadataEntities.length} standard)`,
    );

    if (warnings.length > 0) {
      this.logger.warn(
        `Found ${warnings.length} warning(s) while processing object metadata for workspace ${workspaceId}. These objects will become custom.`,
      );

      for (const { objectMetadataEntity, warning } of warnings) {
        this.logger.warn(
          `Warning for object "${objectMetadataEntity.nameSingular}" (id=${objectMetadataEntity.id} standardId=${objectMetadataEntity.standardId}): ${warning}`,
        );
      }
    }

    if (exceptions.length > 0) {
      this.logger.error(
        `Found ${exceptions.length} exception(s) while processing object metadata for workspace ${workspaceId}. No updates will be applied.`,
      );

      for (const { objectMetadataEntity, exception } of exceptions) {
        this.logger.error(
          `Exception for object "${objectMetadataEntity.nameSingular}" (id=${objectMetadataEntity.id} standardId=${objectMetadataEntity.standardId}): ${exception}`,
        );
      }

      throw new Error(
        `Aborting migration for workspace ${workspaceId} due to ${exceptions.length} exception(s). See logs above for details.`,
      );
    }

    if (!options.dryRun) {
      const customUpdates = customObjectMetadataEntities.map(
        ({ objectMetadataEntity }) => ({
          id: objectMetadataEntity.id,
          universalIdentifier: objectMetadataEntity.universalIdentifier ?? v4(),
          applicationId: workspaceCustomFlatApplication.id,
        }),
      );

      const standardUpdates = standardObjectMetadataEntities.map(
        ({ objectMetadataEntity, universalIdentifier }) => ({
          id: objectMetadataEntity.id,
          universalIdentifier,
          applicationId: twentyStandardFlatApplication.id,
        }),
      );

      await this.objectMetadataRepository.save([
        ...customUpdates,
        ...standardUpdates,
      ]);

      const relatedMetadataNames =
        getMetadataRelatedMetadataNames('objectMetadata');
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
        `Applied ${totalUpdates} object metadata update(s) for workspace ${workspaceId}`,
      );
    } else {
      this.logger.log(
        `Dry run: would apply ${totalUpdates} object metadata update(s) for workspace ${workspaceId}`,
      );
    }
  }
}
