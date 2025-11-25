import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, In, Repository, type QueryRunner } from 'typeorm';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEARCH_FIELDS_FOR_CUSTOM_OBJECT } from 'src/engine/twenty-orm/custom.workspace-entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { type SearchableFieldType } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-searchable-field.util';
import { SEARCH_FIELDS_FOR_COMPANY } from 'src/modules/company/standard-objects/company.workspace-entity';
import { SEARCH_FIELDS_FOR_DASHBOARD } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';
import { SEARCH_FIELDS_FOR_NOTES } from 'src/modules/note/standard-objects/note.workspace-entity';
import { SEARCH_FIELDS_FOR_OPPORTUNITY } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { SEARCH_FIELDS_FOR_PERSON } from 'src/modules/person/standard-objects/person.workspace-entity';
import { SEARCH_FIELDS_FOR_TASKS } from 'src/modules/task/standard-objects/task.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKFLOW_RUNS } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKFLOW_VERSIONS } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKFLOWS } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKSPACE_MEMBER } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const STANDARD_SEARCH_EXPRESSIONS = buildStandardSearchExpressions();

@Command({
  name: 'upgrade:1-10:regenerate-search-vectors',
  description:
    'Regenerate searchVector generated columns using unaccent-aware expressions for every searchable object',
})
export class RegenerateSearchVectorsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
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
    await this.ensureUnaccentFunctionExists();

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const isDryRun = options.dryRun || false;

    const searchableObjects = await this.fetchSearchableObjects(workspaceId);

    if (searchableObjects.length === 0) {
      this.logger.log(
        `No searchable objects found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const objectIds = searchableObjects.map((obj) => obj.id);
    const allIndexes = await this.fetchIndexesForObjects(objectIds);

    let queryRunner: QueryRunner | undefined;

    if (isDryRun) {
      queryRunner = this.coreDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    try {
      for (const object of searchableObjects) {
        try {
          const result = await this.regenerateSearchVectorForObject(
            queryRunner,
            object,
            allIndexes,
            schemaName,
            workspaceId,
          );

          if (result === 'skipped') {
            skipCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          errorCount++;
          this.logger.error(
            `Failed to regenerate search vector for ${object.nameSingular} in workspace ${workspaceId}`,
            error,
          );

          if (isDryRun) {
            throw error;
          }
        }
      }

      if (isDryRun && queryRunner) {
        await queryRunner.rollbackTransaction();
        this.logger.log(
          `DRY RUN: Would regenerate ${successCount} search vectors, skip ${skipCount}, ${errorCount} errors - rolled back all changes`,
        );
      } else {
        this.logger.log(
          `Search vector regeneration complete for workspace ${workspaceId}: ${successCount} succeeded, ${skipCount} skipped, ${errorCount} failed out of ${searchableObjects.length} total`,
        );
      }
    } catch (error) {
      if (queryRunner?.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      if (queryRunner) {
        await queryRunner.release();
      }
    }
  }

  private async fetchSearchableObjects(
    workspaceId: string,
  ): Promise<ObjectMetadataEntity[]> {
    return this.objectMetadataRepository.find({
      where: {
        workspaceId,
        isSearchable: true,
      },
      relations: ['fields'],
    });
  }

  private async fetchIndexesForObjects(
    objectIds: string[],
  ): Promise<IndexMetadataEntity[]> {
    return this.indexMetadataRepository.find({
      where: {
        objectMetadataId: In(objectIds),
      },
      relations: ['indexFieldMetadatas'],
    });
  }

  private async regenerateSearchVectorForObject(
    queryRunner: QueryRunner | undefined,
    object: ObjectMetadataEntity,
    allIndexes: IndexMetadataEntity[],
    schemaName: string,
    workspaceId: string,
  ): Promise<'success' | 'skipped'> {
    const searchVectorField = this.findSearchVectorField(object);

    if (!searchVectorField) {
      this.logger.warn(
        `Search vector field not found for ${object.nameSingular} in workspace ${workspaceId}, skipping`,
      );

      return 'skipped';
    }

    const searchExpression = this.buildSearchExpression(object);

    if (!searchExpression) {
      this.logger.warn(
        `Cannot determine search expression for ${object.nameSingular} in workspace ${workspaceId}, skipping`,
      );

      return 'skipped';
    }

    const tableName = computeObjectTargetTable({
      nameSingular: object.nameSingular,
      isCustom: object.isCustom,
    });

    const existingIndex = this.findSearchVectorIndex(
      allIndexes,
      object.id,
      searchVectorField.id,
    );

    let localQueryRunner: QueryRunner;
    const shouldRelease = !queryRunner;

    if (queryRunner) {
      localQueryRunner = queryRunner;
    } else {
      localQueryRunner = this.coreDataSource.createQueryRunner();
      await localQueryRunner.connect();
    }

    try {
      if (existingIndex) {
        await this.dropIndex(localQueryRunner, schemaName, existingIndex.name);
      }

      await this.dropSearchVectorColumn(
        localQueryRunner,
        schemaName,
        tableName,
      );

      await this.createSearchVectorColumn(
        localQueryRunner,
        schemaName,
        tableName,
        searchExpression,
      );

      if (existingIndex) {
        await this.recreateIndex(
          localQueryRunner,
          schemaName,
          tableName,
          existingIndex,
        );
      }

      this.logger.log(
        `Regenerated search vector for ${object.nameSingular} in workspace ${workspaceId}`,
      );

      return 'success';
    } finally {
      if (shouldRelease) {
        await localQueryRunner.release();
      }
    }
  }

  private findSearchVectorField(
    object: ObjectMetadataEntity,
  ): ObjectMetadataEntity['fields'][0] | undefined {
    return object.fields.find(
      (field) => field.name === SEARCH_VECTOR_FIELD.name,
    );
  }

  private findSearchVectorIndex(
    allIndexes: IndexMetadataEntity[],
    objectId: string,
    searchVectorFieldId: string,
  ): IndexMetadataEntity | undefined {
    return allIndexes.find(
      (index) =>
        index.objectMetadataId === objectId &&
        index.indexFieldMetadatas.some(
          (indexField) => indexField.fieldMetadataId === searchVectorFieldId,
        ),
    );
  }

  private buildSearchExpression(
    object: ObjectMetadataEntity,
  ): string | undefined {
    if (object.standardId) {
      const standardExpression = STANDARD_SEARCH_EXPRESSIONS[object.standardId];

      if (standardExpression) {
        return standardExpression;
      }
    }

    if (object.isCustom) {
      return this.buildCustomObjectSearchExpression(object);
    }

    return undefined;
  }

  private buildCustomObjectSearchExpression(
    object: ObjectMetadataEntity,
  ): string {
    const labelField = object.fields.find(
      (field) => field.id === object.labelIdentifierFieldMetadataId,
    );

    if (!labelField) {
      return getTsVectorColumnExpressionFromFields(
        SEARCH_FIELDS_FOR_CUSTOM_OBJECT,
      );
    }

    return getTsVectorColumnExpressionFromFields([
      {
        name: labelField.name,
        type: labelField.type as SearchableFieldType,
      },
    ]);
  }

  private async dropIndex(
    queryRunner: QueryRunner,
    schemaName: string,
    indexName: string,
  ): Promise<void> {
    await this.workspaceSchemaManager.indexManager.dropIndex({
      queryRunner,
      schemaName,
      indexName,
    });
  }

  private async dropSearchVectorColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
  ): Promise<void> {
    await this.workspaceSchemaManager.columnManager.dropColumns({
      queryRunner,
      schemaName,
      tableName,
      columnNames: [SEARCH_VECTOR_FIELD.name],
    });
  }

  private async createSearchVectorColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    expression: string,
  ): Promise<void> {
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
          asExpression: expression,
        },
      ],
    });
  }

  private async recreateIndex(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    index: IndexMetadataEntity,
  ): Promise<void> {
    await this.workspaceSchemaManager.indexManager.createIndex({
      queryRunner,
      schemaName,
      tableName,
      index: {
        name: index.name,
        columns: [SEARCH_VECTOR_FIELD.name],
        type: index.indexType,
        isUnique: index.isUnique,
        where: index.indexWhereClause ?? undefined,
      },
    });
  }

  private async ensureUnaccentFunctionExists(): Promise<void> {
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

function buildStandardSearchExpressions(): Partial<Record<string, string>> {
  const standardObjectSearchFields = {
    person: SEARCH_FIELDS_FOR_PERSON,
    company: SEARCH_FIELDS_FOR_COMPANY,
    opportunity: SEARCH_FIELDS_FOR_OPPORTUNITY,
    task: SEARCH_FIELDS_FOR_TASKS,
    note: SEARCH_FIELDS_FOR_NOTES,
    dashboard: SEARCH_FIELDS_FOR_DASHBOARD,
    workspaceMember: SEARCH_FIELDS_FOR_WORKSPACE_MEMBER,
    workflow: SEARCH_FIELDS_FOR_WORKFLOWS,
    workflowVersion: SEARCH_FIELDS_FOR_WORKFLOW_VERSIONS,
    workflowRun: SEARCH_FIELDS_FOR_WORKFLOW_RUNS,
  };

  const expressions: Partial<Record<string, string>> = {};

  for (const [objectKey, searchFields] of Object.entries(
    standardObjectSearchFields,
  )) {
    const standardId =
      STANDARD_OBJECT_IDS[objectKey as keyof typeof standardObjectSearchFields];

    expressions[standardId] =
      getTsVectorColumnExpressionFromFields(searchFields);
  }

  return expressions;
}
