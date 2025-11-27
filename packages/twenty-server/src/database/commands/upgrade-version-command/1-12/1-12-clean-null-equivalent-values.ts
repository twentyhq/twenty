import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import deepEqual from 'deep-equal';
import { Command } from 'nest-commander';
import {
  CompositeType,
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { deprecatedGenerateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/deprecated-generate-default-value';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationIndexAction,
  WorkspaceMigrationIndexActionType,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';

@Command({
  name: 'upgrade:1-12:clean-null-equivalent-values',
  description: 'Clean up null equivalent values in the database',
})
export class CleanNullEquivalentValuesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(CleanNullEquivalentValuesCommand.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(ObjectMetadataEntity)
    protected readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    protected readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(IndexMetadataEntity)
    protected readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
    @InjectRepository(FeatureFlagEntity)
    protected readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    protected readonly workspaceMigrationService: WorkspaceMigrationService,
    protected readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    protected readonly dataSourceService: DataSourceService,
    protected readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    if (!isDefined(dataSource)) {
      throw new Error(
        `Could not find data source for workspace ${workspaceId}, should never occur`,
      );
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    if (isDryRun) {
      this.logger.log('Dry run mode: No changes will be applied');
    }

    const featureFlag = await this.featureFlagRepository.findOne({
      where: {
        key: FeatureFlagKey.IS_NULL_EQUIVALENCE_ENABLED,
        value: true,
        workspaceId,
      },
    });

    if (isDefined(featureFlag)) {
      this.logger.log(
        `Feature flag ${FeatureFlagKey.IS_NULL_EQUIVALENCE_ENABLED} already enabled for workspace ${workspaceId}`,
      );

      return;
    }

    const objectMetadataItems = await this.objectMetadataRepository.find({
      where: { workspaceId },
      relations: [
        'fields',
        'indexMetadatas',
        'indexMetadatas.indexFieldMetadatas',
      ],
    });

    for (const objectMetadataItem of objectMetadataItems) {
      const tableName = computeObjectTargetTable(objectMetadataItem);

      for (const field of objectMetadataItem.fields) {
        const fieldDefaultDefaultValue = deprecatedGenerateDefaultValue(
          field.type,
        );

        if (
          !(
            isDefined(field.defaultValue) &&
            ((typeof field.defaultValue === 'string' &&
              field.defaultValue === fieldDefaultDefaultValue) ||
              this.objectEquals(
                field.defaultValue,
                fieldDefaultDefaultValue,
              )) &&
            field.type !== FieldMetadataType.ACTOR
          )
        )
          continue;

        this.logger.log(
          `Processing field ${field.name} on object ${objectMetadataItem.nameSingular} (Table: ${tableName})`,
        );
        if (!isDryRun) {
          if (isCompositeFieldMetadataType(field.type)) {
            const compositeType = compositeTypeDefinitions.get(field.type);

            if (isDefined(compositeType)) {
              for (const property of compositeType.properties) {
                const columnName = computeCompositeColumnName(
                  field.name,
                  property,
                );

                await dataSource.query(
                  `ALTER TABLE "${schemaName}"."${tableName}" ALTER COLUMN "${columnName}" DROP NOT NULL, ALTER COLUMN "${columnName}" DROP DEFAULT`,
                  [],
                  undefined,
                  { shouldBypassPermissionChecks: true },
                );

                await dataSource.query(
                  `UPDATE "${schemaName}"."${tableName}" SET "${columnName}" = NULL WHERE "${columnName}" = ${field.defaultValue[property.name as keyof typeof field.defaultValue]}`,
                  [],
                  undefined,
                  { shouldBypassPermissionChecks: true },
                );
              }
            }
          } else {
            await dataSource.query(
              `ALTER TABLE "${schemaName}"."${tableName}" ALTER COLUMN "${field.name}" DROP NOT NULL, ALTER COLUMN "${field.name}" DROP DEFAULT`,
              [],
              undefined,
              { shouldBypassPermissionChecks: true },
            );

            await dataSource.query(
              `UPDATE "${schemaName}"."${tableName}" SET "${field.name}" = NULL WHERE "${field.name}" = ${field.defaultValue}`,
              [],
              undefined,
              { shouldBypassPermissionChecks: true },
            );
          }

          await this.fieldMetadataRepository.update(field.id, {
            isNullable: true,
            defaultValue: null,
          });

          await this.workspaceManyOrAllFlatEntityMapsCacheService.invalidateFlatEntityMaps(
            {
              workspaceId,
              flatMapsKeys: ['flatFieldMetadataMaps'],
            },
          );
        }

        const relevantIndexes = objectMetadataItem.indexMetadatas.filter(
          (index) =>
            index.isUnique &&
            index.indexFieldMetadatas.some(
              (ifm) => ifm.fieldMetadataId === field.id,
            ),
        );

        for (const index of relevantIndexes) {
          if (!isDryRun) {
            this.logger.log(
              `Removing where clause from index ${index.name} on ${tableName}`,
            );

            await this.indexMetadataRepository.update(index.id, {
              indexWhereClause: null,
            });

            await this.workspaceManyOrAllFlatEntityMapsCacheService.invalidateFlatEntityMaps(
              {
                workspaceId,
                flatMapsKeys: ['flatIndexMaps'],
              },
            );

            const columnNames = index.indexFieldMetadatas.flatMap(
              (indexFieldMetadata) => {
                const fieldMetadata = objectMetadataItem.fields.find(
                  (f) => f.id === indexFieldMetadata.fieldMetadataId,
                );

                if (!isDefined(fieldMetadata)) {
                  throw new Error(
                    `Field metadata not found for index field metadata ${indexFieldMetadata.id}`,
                  );
                }

                if (isCompositeFieldMetadataType(fieldMetadata.type)) {
                  const compositeType = compositeTypeDefinitions.get(
                    fieldMetadata.type,
                  ) as CompositeType;

                  const uniqueCompositeProperties =
                    compositeType.properties.filter(
                      (property) => property.isIncludedInUniqueConstraint,
                    );

                  return uniqueCompositeProperties.map((subField) =>
                    computeCompositeColumnName(fieldMetadata.name, subField),
                  );
                }

                return [fieldMetadata.name];
              },
            );

            const dropIndexAction: WorkspaceMigrationIndexAction = {
              action: WorkspaceMigrationIndexActionType.DROP,
              name: index.name,
              columns: [],
              isUnique: true,
            };

            const createIndexAction: WorkspaceMigrationIndexAction = {
              action: WorkspaceMigrationIndexActionType.CREATE,
              name: index.name,
              columns: columnNames,
              isUnique: true,
              where: null,
            };

            const migration: WorkspaceMigrationTableAction = {
              name: tableName,
              action: WorkspaceMigrationTableActionType.ALTER_INDEXES,
              indexes: [dropIndexAction, createIndexAction],
            };

            await this.workspaceMigrationService.createCustomMigration(
              generateMigrationName(`update-index-${index.name}-remove-where`),
              workspaceId,
              [migration],
            );

            await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
              workspaceId,
            );
          }
        }
      }
    }
    if (!isDryRun) {
      await this.featureFlagRepository.upsert(
        {
          key: FeatureFlagKey.IS_NULL_EQUIVALENCE_ENABLED,
          value: true,
          workspaceId,
        },
        ['key', 'workspaceId'],
      );

      this.logger.log(
        `Switched on feature flag ${FeatureFlagKey.IS_NULL_EQUIVALENCE_ENABLED} for workspace ${workspaceId}`,
      );
    }
  }

  private objectEquals(obj1: unknown, obj2: unknown): boolean {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return false;
    }

    return deepEqual(obj1, obj2, { strict: true });
  }
}
