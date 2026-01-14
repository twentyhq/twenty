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
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

type CustomFieldMetadata = {
  fieldMetadataEntity: FieldMetadataEntity;
  fromStandard: boolean;
};

type StandardFieldMetadata = {
  fieldMetadataEntity: FieldMetadataEntity;
  universalIdentifier: string;
};

type AllWarnings = 'unknown_standard_id';

type FieldMetadataWarning = {
  fieldMetadataEntity: FieldMetadataEntity;
  warning: AllWarnings;
};

type AllExceptions = 'existing_universal_id_mismatch';

type FieldMetadataException = {
  fieldMetadataEntity: FieldMetadataEntity;
  exception: AllExceptions;
};

@Command({
  name: 'upgrade:1-16:identify-field-metadata',
  description: 'Identify standard field metadata',
})
export class IdentifyFieldMetadataCommand extends WorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    protected readonly applicationService: ApplicationService,
    protected readonly workspaceCacheService: WorkspaceCacheService,
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
      `Running identify standard field metadata for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const allFieldMetadataEntities = await this.fieldMetadataRepository.find({
      select: {
        id: true,
        universalIdentifier: true,
        applicationId: true,
        name: true,
        standardId: true,
        object: {
          nameSingular: true,
        },
        isCustom: true,
      },
      relations: ['object'],
      where: {
        workspaceId,
        applicationId: IsNull(),
      },
    });

    const customFieldMetadataEntities: CustomFieldMetadata[] = [];
    const standardFieldMetadataEntities: StandardFieldMetadata[] = [];
    const warnings: FieldMetadataWarning[] = [];
    const exceptions: FieldMetadataException[] = [];

    for (const fieldMetadataEntity of allFieldMetadataEntities) {
      const isStandardMetadataResult = isStandardMetadata(fieldMetadataEntity);

      if (!isStandardMetadataResult) {
        customFieldMetadataEntities.push({
          fieldMetadataEntity,
          fromStandard: false,
        });

        continue;
      }

      const objectConfig =
        STANDARD_OBJECTS[
          fieldMetadataEntity.object
            .nameSingular as keyof typeof STANDARD_OBJECTS
        ];
      const universalIdentifier =
        objectConfig?.fields[
          fieldMetadataEntity.name as keyof typeof objectConfig.fields
        ]?.universalIdentifier;

      if (!isDefined(universalIdentifier)) {
        warnings.push({
          fieldMetadataEntity,
          warning: 'unknown_standard_id',
        });
        customFieldMetadataEntities.push({
          fieldMetadataEntity,
          fromStandard: true,
        });
        continue;
      }

      if (
        isDefined(fieldMetadataEntity.universalIdentifier) &&
        fieldMetadataEntity.universalIdentifier !== universalIdentifier
      ) {
        exceptions.push({
          fieldMetadataEntity,
          exception: 'existing_universal_id_mismatch',
        });
        continue;
      }

      standardFieldMetadataEntities.push({
        fieldMetadataEntity,
        universalIdentifier:
          fieldMetadataEntity.universalIdentifier ?? universalIdentifier,
      });
    }

    const totalUpdates =
      customFieldMetadataEntities.length + standardFieldMetadataEntities.length;

    if (warnings.length > 0) {
      this.logger.warn(
        `Found ${warnings.length} warning(s) while processing field metadata for workspace ${workspaceId}. These fields will become custom.`,
      );

      for (const { fieldMetadataEntity, warning } of warnings) {
        this.logger.warn(
          `Warning for field "${fieldMetadataEntity.name}" on object "${fieldMetadataEntity.object.nameSingular}" (id=${fieldMetadataEntity.id} standardId=${fieldMetadataEntity.standardId}): ${warning}`,
        );
      }
    }

    if (exceptions.length > 0) {
      this.logger.error(
        `Found ${exceptions.length} exception(s) while processing field metadata for workspace ${workspaceId}. No updates will be applied.`,
      );

      for (const { fieldMetadataEntity, exception } of exceptions) {
        this.logger.error(
          `Exception for field "${fieldMetadataEntity.name}" on object "${fieldMetadataEntity.object.nameSingular}" (id=${fieldMetadataEntity.id} standardId=${fieldMetadataEntity.standardId}): ${exception}`,
        );
      }

      throw new Error(
        `Aborting migration for workspace ${workspaceId} due to ${exceptions.length} exception(s). See logs above for details.`,
      );
    }

    this.logger.log(
      `Successfully validated ${totalUpdates}/${allFieldMetadataEntities.length} field metadata update(s) for workspace ${workspaceId} (${customFieldMetadataEntities.length} custom, ${standardFieldMetadataEntities.length} standard)`,
    );

    if (!options.dryRun) {
      const customUpdates = customFieldMetadataEntities.map(
        ({ fieldMetadataEntity }) => ({
          id: fieldMetadataEntity.id,
          universalIdentifier: fieldMetadataEntity.universalIdentifier ?? v4(),
          applicationId: workspaceCustomFlatApplication.id,
        }),
      );

      const standardUpdates = standardFieldMetadataEntities.map(
        ({ fieldMetadataEntity, universalIdentifier }) => ({
          id: fieldMetadataEntity.id,
          universalIdentifier,
          applicationId: twentyStandardFlatApplication.id,
        }),
      );

      await this.fieldMetadataRepository.save([
        ...customUpdates,
        ...standardUpdates,
      ]);

      const relatedMetadataNames =
        getMetadataRelatedMetadataNames('fieldMetadata');
      const relatedCacheKeysToInvalidate = relatedMetadataNames.map(
        getMetadataFlatEntityMapsKey,
      );

      this.logger.log(
        `Invalidating caches: flatFieldMetadataMaps ${relatedCacheKeysToInvalidate.join(' ')}`,
      );
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        ...relatedCacheKeysToInvalidate,
      ]);

      this.logger.log(
        `Applied ${totalUpdates} field metadata update(s) for workspace ${workspaceId}`,
      );
    } else {
      this.logger.log(
        `Dry run: would apply ${totalUpdates} field metadata update(s) for workspace ${workspaceId}`,
      );
    }
  }
}
