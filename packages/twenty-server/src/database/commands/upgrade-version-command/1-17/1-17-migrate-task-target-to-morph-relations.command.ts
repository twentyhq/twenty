import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  type FieldMetadataSettings,
} from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

type RelationFieldMetadataSettings =
  FieldMetadataSettings<FieldMetadataType.RELATION>;

@Command({
  name: 'upgrade:1-17:migrate-task-target-to-morph-relations',
  description:
    'Migrate taskTarget relations to morph relation fields and set feature flag',
})
export class MigrateTaskTargetToMorphRelationsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly featureFlagService: FeatureFlagService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isMigrated = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_TASK_TARGET_MIGRATED,
      workspaceId,
    );

    this.logger.log(`Migrating taskTarget for workspace ${workspaceId}`);

    if (isMigrated) {
      this.logger.log(`TaskTarget migration already completed. Skipping...`);

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would have migrated taskTarget for workspace ${workspaceId}. Skipping...`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const schemaName = getWorkspaceSchemaName(workspaceId);
      const tableName = 'taskTarget';

      const {
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatApplicationMaps,
      } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatApplicationMaps',
      ]);

      const taskTargetFieldUniversalIdentifiers = new Set<string>([
        STANDARD_OBJECTS.taskTarget.fields.targetPerson.universalIdentifier,
        STANDARD_OBJECTS.taskTarget.fields.targetCompany.universalIdentifier,
        STANDARD_OBJECTS.taskTarget.fields.targetOpportunity
          .universalIdentifier,
      ]);

      const taskTargetObjectMetadata =
        findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier: STANDARD_OBJECTS.taskTarget.universalIdentifier,
        });

      if (!taskTargetObjectMetadata) {
        this.logger.error(
          `🟥 ${tableName} object metadata not found for workspace ${workspaceId}`,
        );

        return;
      }

      const taskTargetFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
        taskTargetObjectMetadata,
        flatFieldMetadataMaps,
      );

      const taskTargetRelationFields = taskTargetFieldMetadatas
        .filter(isMorphOrRelationFlatFieldMetadata)
        .filter((field) => field.type === FieldMetadataType.RELATION)
        .filter((field) => {
          const isStandardAppField = this.isTwentyStandardApplicationField({
            field,
            flatApplicationMaps,
            workspaceId,
          });
          const isStandardTarget =
            isStandardAppField &&
            taskTargetFieldUniversalIdentifiers.has(field.universalIdentifier);
          const targetObjectMetadata = field.relationTargetObjectMetadataId
            ? findFlatEntityByIdInFlatEntityMaps({
                flatEntityMaps: flatObjectMetadataMaps,
                flatEntityId: field.relationTargetObjectMetadataId,
              })
            : undefined;
          const isCustomTarget =
            !isStandardAppField && targetObjectMetadata?.isCustom === true;

          return isStandardTarget || isCustomTarget;
        });

      const fieldMigrations = taskTargetRelationFields.map((field) => {
        const newFieldName = `target${capitalize(field.name)}`;
        const newFieldLabel = 'Target';
        const relationSettings: RelationFieldMetadataSettings = field.settings;
        const oldJoinColumnName =
          relationSettings?.joinColumnName ??
          computeMorphOrRelationFieldJoinColumnName({ name: field.name });
        const newJoinColumnName = computeMorphOrRelationFieldJoinColumnName({
          name: newFieldName,
        });

        return {
          field,
          newFieldName,
          newFieldLabel,
          oldJoinColumnName,
          newJoinColumnName,
        };
      });

      // Rename columns
      for (const { oldJoinColumnName, newJoinColumnName } of fieldMigrations) {
        if (oldJoinColumnName === newJoinColumnName) {
          this.logger.log(
            `Column "${oldJoinColumnName}" already renamed. Skipping...`,
          );
          continue;
        }

        try {
          await queryRunner.query(
            `ALTER TABLE "${schemaName}"."${tableName}"
           RENAME COLUMN "${oldJoinColumnName}" TO "${newJoinColumnName}"`,
          );
          this.logger.log(
            `Renamed column "${oldJoinColumnName}" to "${newJoinColumnName}" for "${tableName}"`,
          );
        } catch (error) {
          this.logger.error(
            `Error renaming column "${oldJoinColumnName}" to "${newJoinColumnName}" for "${tableName}" in workspace ${workspaceId}`,
            error,
          );

          throw error;
        }
      }

      this.logger.log(`✅ Successfully migrated ${tableName} records`);

      const morphId =
        STANDARD_OBJECTS.taskTarget.morphIds.targetMorphId.morphId;

      // Update field metadata
      for (const {
        field: fieldToMigrate,
        newFieldName,
        newFieldLabel,
        newJoinColumnName,
      } of fieldMigrations) {
        const settings = {
          ...fieldToMigrate.settings,
          joinColumnName: newJoinColumnName,
        };

        try {
          const result = await queryRunner.query(
            `UPDATE core."fieldMetadata"
           SET name = $1, type = $5, "morphId" = $3, settings = $4, "isActive" = true, label = $6
           WHERE id = $2`,
            [
              newFieldName,
              fieldToMigrate.id,
              morphId,
              settings,
              FieldMetadataType.MORPH_RELATION,
              newFieldLabel,
            ],
          );

          const rowsUpdated = result[1] || 0;

          if (rowsUpdated > 0) {
            this.logger.log(
              `Updated fieldMetadata: ${fieldToMigrate.name} → ${newFieldName} (label: ${newFieldLabel}, type: MORPH_RELATION)`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error updating fieldMetadata for field "${fieldToMigrate.name}" in workspace ${workspaceId}`,
            error,
          );

          throw error;
        }
      }

      this.logger.log(`✅ Successfully migrated ${tableName} fieldmetadata`);

      await queryRunner.commitTransaction();

      await this.featureFlagService.enableFeatureFlags(
        [FeatureFlagKey.IS_TASK_TARGET_MIGRATED],
        workspaceId,
      );

      const relatedMetadataNames =
        getMetadataRelatedMetadataNames('fieldMetadata');
      const relatedCacheKeysToInvalidate: WorkspaceCacheKeyName[] =
        relatedMetadataNames.map(getMetadataFlatEntityMapsKey);
      const cacheKeysToInvalidate: WorkspaceCacheKeyName[] = [
        'flatFieldMetadataMaps',
        ...relatedCacheKeysToInvalidate,
        'featureFlagsMap',
      ];

      this.logger.log(
        `Invalidating caches: ${cacheKeysToInvalidate.join(' ')}`,
      );

      await this.workspaceCacheService.invalidateAndRecompute(
        workspaceId,
        cacheKeysToInvalidate,
      );

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );
      this.logger.log(`Cache flushed`);

      this.logger.log(
        `Set IS_TASK_TARGET_MIGRATED feature flag for workspace ${workspaceId}`,
      );

      this.logger.log(`Flush cache for workspace ${workspaceId}`);
      await this.workspaceCacheStorageService.flush(workspaceId);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Error migrating taskTarget to morph relations (rolled transaction back on ${workspaceId})`,
          error,
        );
      } else {
        this.logger.error(
          `Error migrating taskTarget to morph relations after commit on ${workspaceId}`,
          error,
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private isTwentyStandardApplicationField({
    field,
    flatApplicationMaps,
    workspaceId,
  }: {
    field: { id: string; name: string; applicationId: string };
    flatApplicationMaps: FlatApplicationCacheMaps;
    workspaceId: string;
  }): boolean {
    const application = flatApplicationMaps.byId[field.applicationId];

    if (!application) {
      this.logger.error(
        `🟥 Application not found for field "${field.name}" (${field.id}) in workspace ${workspaceId} (applicationId: ${field.applicationId})`,
      );

      return false;
    }

    return (
      application.universalIdentifier ===
      TWENTY_STANDARD_APPLICATION.universalIdentifier
    );
  }
}
