import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, In, Repository, type QueryRunner } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  type FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { SEARCH_FIELDS_FOR_COMPANY } from 'src/modules/company/standard-objects/company.workspace-entity';
import { SEARCH_FIELDS_FOR_CUSTOM_OBJECT } from 'src/engine/twenty-orm/custom.workspace-entity';
import { SEARCH_FIELDS_FOR_NOTES } from 'src/modules/note/standard-objects/note.workspace-entity';
import { SEARCH_FIELDS_FOR_OPPORTUNITY } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { SEARCH_FIELDS_FOR_PERSON } from 'src/modules/person/standard-objects/person.workspace-entity';
import { SEARCH_FIELDS_FOR_TASKS } from 'src/modules/task/standard-objects/task.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKSPACE_MEMBER } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKFLOW_RUNS } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKFLOW_VERSIONS } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKFLOWS } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

const hasAsExpressionSetting = (
  settings: FieldMetadataEntity['settings'],
): settings is { asExpression?: string } =>
  typeof settings === 'object' &&
  settings !== null &&
  'asExpression' in settings;

@Command({
  name: 'upgrade:1-10:regenerate-search-vectors',
  description:
    'Regenerate searchVector generated columns using unaccent-aware expressions for every searchable object',
})
export class RegenerateSearchVectorsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private readonly standardObjectSearchFields: Record<
    string,
    FieldTypeAndNameMetadata[]
  > = {
    [STANDARD_OBJECT_IDS.person]: SEARCH_FIELDS_FOR_PERSON,
    [STANDARD_OBJECT_IDS.company]: SEARCH_FIELDS_FOR_COMPANY,
    [STANDARD_OBJECT_IDS.opportunity]: SEARCH_FIELDS_FOR_OPPORTUNITY,
    [STANDARD_OBJECT_IDS.task]: SEARCH_FIELDS_FOR_TASKS,
    [STANDARD_OBJECT_IDS.note]: SEARCH_FIELDS_FOR_NOTES,
    [STANDARD_OBJECT_IDS.workspaceMember]: SEARCH_FIELDS_FOR_WORKSPACE_MEMBER,
    [STANDARD_OBJECT_IDS.workflow]: SEARCH_FIELDS_FOR_WORKFLOWS,
    [STANDARD_OBJECT_IDS.workflowVersion]: SEARCH_FIELDS_FOR_WORKFLOW_VERSIONS,
    [STANDARD_OBJECT_IDS.workflowRun]: SEARCH_FIELDS_FOR_WORKFLOW_RUNS,
  };

  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceSchemaManager: WorkspaceSchemaManagerService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    await this.ensureUnaccentFunction();

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const isDryRun = Boolean(options.dryRun);

    const searchableObjects = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
        isSearchable: true,
      },
      relations: ['fields'],
    });

    if (searchableObjects.length === 0) {
      this.logger.log(
        `No searchable objects found for workspace ${workspaceId}, skipping search vector regeneration`,
      );

      return;
    }

    const indexMetadatas = await this.indexMetadataRepository.find({
      where: {
        objectMetadataId: In(
          searchableObjects.map((objectMetadata) => objectMetadata.id),
        ),
      },
      relations: ['indexFieldMetadatas'],
    });

    try {
      await queryRunner.startTransaction();

      for (const objectMetadata of searchableObjects) {
        if (objectMetadata.standardId === STANDARD_OBJECT_IDS.dashboard) {
          continue;
        }

        const searchVectorFieldMetadata = objectMetadata.fields.find(
          (field) => field.name === SEARCH_VECTOR_FIELD.name,
        );

        if (!searchVectorFieldMetadata) {
          this.logger.warn(
            `Search vector field metadata not found for object ${objectMetadata.nameSingular} in workspace ${workspaceId}, skipping`,
          );

          continue;
        }

        const columnExpression = this.computeSearchVectorExpression({
          objectMetadata,
          searchVectorFieldMetadata,
        });

        if (!columnExpression) {
          this.logger.warn(
            `Unable to determine search vector expression for object ${objectMetadata.nameSingular} in workspace ${workspaceId}, skipping`,
          );

          continue;
        }

        const tableName = computeObjectTargetTable({
          nameSingular: objectMetadata.nameSingular,
          isCustom: objectMetadata.isCustom,
        });

        const searchVectorIndexes = indexMetadatas.filter(
          (indexMetadata) =>
            indexMetadata.objectMetadataId === objectMetadata.id &&
            indexMetadata.indexFieldMetadatas.some(
              (indexFieldMetadata) =>
                indexFieldMetadata.fieldMetadataId ===
                searchVectorFieldMetadata.id,
            ),
        );

        for (const indexMetadata of searchVectorIndexes) {
          await this.workspaceSchemaManager.indexManager.dropIndex({
            queryRunner,
            schemaName,
            indexName: indexMetadata.name,
          });
        }

        await this.workspaceSchemaManager.columnManager.dropColumns({
          queryRunner,
          schemaName,
          tableName,
          columnNames: [SEARCH_VECTOR_FIELD.name],
        });

        await this.workspaceSchemaManager.columnManager.addColumns({
          queryRunner,
          schemaName,
          tableName,
          columnDefinitions: [
            {
              name: SEARCH_VECTOR_FIELD.name,
              type: 'tsvector',
              isNullable: true,
              generatedType: 'STORED',
              asExpression: columnExpression,
            },
          ],
        });

        for (const indexMetadata of searchVectorIndexes) {
          const sortedIndexFields = [...indexMetadata.indexFieldMetadatas].sort(
            (left, right) => left.order - right.order,
          );

          const columns = sortedIndexFields
            .map((indexFieldMetadata) =>
              objectMetadata.fields.find(
                (field) => field.id === indexFieldMetadata.fieldMetadataId,
              )?.name,
            )
            .filter((columnName): columnName is string => Boolean(columnName));

          if (columns.length === 0) {
            this.logger.warn(
              `Unable to recreate index ${indexMetadata.name} for object ${objectMetadata.nameSingular} in workspace ${workspaceId} – no columns resolved`,
            );

            continue;
          }

          await this.workspaceSchemaManager.indexManager.createIndex({
            queryRunner,
            schemaName,
            tableName,
            index: {
              name: indexMetadata.name,
              columns,
              type: indexMetadata.indexType,
              isUnique: indexMetadata.isUnique,
              where: indexMetadata.indexWhereClause ?? undefined,
            },
          });
        }

        this.logger.log(
          `Regenerated search vector column for object ${objectMetadata.nameSingular} in workspace ${workspaceId}`,
        );
      }

      await this.handleDryRun(queryRunner, isDryRun);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      this.logger.error(
        `Failed to regenerate search vectors for workspace ${workspaceId}: ${error.message}`,
      );

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private computeSearchVectorExpression({
    objectMetadata,
    searchVectorFieldMetadata,
  }: {
    objectMetadata: ObjectMetadataEntity;
    searchVectorFieldMetadata: FieldMetadataEntity;
  }): string | undefined {
    if (objectMetadata.standardId) {
      const searchFields = this.standardObjectSearchFields[objectMetadata.standardId];

      if (searchFields) {
        return getTsVectorColumnExpressionFromFields(searchFields);
      }
    }

    if (objectMetadata.isCustom) {
      return getTsVectorColumnExpressionFromFields(SEARCH_FIELDS_FOR_CUSTOM_OBJECT);
    }

    const storedExpressionFromSettings = hasAsExpressionSetting(
      searchVectorFieldMetadata.settings,
    )
      ? searchVectorFieldMetadata.settings.asExpression
      : undefined;

    if (storedExpressionFromSettings) {
      return storedExpressionFromSettings;
    }

    const storedExpressionFromEntity = Reflect.get(
      searchVectorFieldMetadata,
      'asExpression',
    );

    if (typeof storedExpressionFromEntity === 'string') {
      return storedExpressionFromEntity;
    }

    return undefined;
  }

  private async handleDryRun(
    queryRunner: QueryRunner,
    isDryRun: boolean,
  ): Promise<void> {
    if (isDryRun) {
      await queryRunner.rollbackTransaction();
      this.logger.log('DRY RUN: Rolled back regenerated search vector changes');

      return;
    }

    await queryRunner.commitTransaction();
  }

  private async ensureUnaccentFunction(): Promise<void> {
    const result = await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'unaccent_immutable'
      ) as function_exists
    `);

    if (!result[0]?.function_exists) {
      throw new Error(
        'The public.unaccent_immutable() function is required but not found. Please run database migrations first.',
      );
    }
  }
}
