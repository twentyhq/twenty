import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, In, Repository, type QueryRunner } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEARCH_FIELDS_FOR_CUSTOM_OBJECT } from 'src/engine/twenty-orm/custom.workspace-entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
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
    await this.ensureUnaccentFunctionExists();

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
        `No searchable objects found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const allIndexes = await this.indexMetadataRepository.find({
      where: {
        objectMetadataId: In(searchableObjects.map((obj) => obj.id)),
      },
      relations: ['indexFieldMetadatas'],
    });

    let queryRunner: QueryRunner | undefined;

    try {
      queryRunner = this.coreDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      for (const objectMetadata of searchableObjects) {
        await this.regenerateSearchVectorForObject(
          queryRunner,
          objectMetadata,
          allIndexes,
          schemaName,
          workspaceId,
        );
      }

      if (isDryRun) {
        await queryRunner.rollbackTransaction();
        this.logger.log('DRY RUN: Rolled back all changes');
      } else {
        await queryRunner.commitTransaction();
      }
    } catch (error) {
      if (queryRunner?.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      this.logger.error(
        `Failed to regenerate search vectors for workspace ${workspaceId}`,
      );

      throw error;
    } finally {
      if (queryRunner) {
        await queryRunner.release();
      }
    }
  }

  private async regenerateSearchVectorForObject(
    queryRunner: QueryRunner,
    objectMetadata: ObjectMetadataEntity,
    allIndexes: IndexMetadataEntity[],
    schemaName: string,
    workspaceId: string,
  ): Promise<void> {
    const searchVectorField = objectMetadata.fields.find(
      (field) => field.name === SEARCH_VECTOR_FIELD.name,
    );

    if (!searchVectorField) {
      this.logger.warn(
        `Search vector field not found for ${objectMetadata.nameSingular} in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const searchExpression = this.getSearchVectorExpression(objectMetadata);

    if (!searchExpression) {
      this.logger.warn(
        `Cannot determine search expression for ${objectMetadata.nameSingular} in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const tableName = computeObjectTargetTable({
      nameSingular: objectMetadata.nameSingular,
      isCustom: objectMetadata.isCustom,
    });

    const searchVectorIndex = allIndexes.find(
      (index) =>
        index.objectMetadataId === objectMetadata.id &&
        index.indexFieldMetadatas.some(
          (indexField) => indexField.fieldMetadataId === searchVectorField.id,
        ),
    );

    if (searchVectorIndex) {
      await this.workspaceSchemaManager.indexManager.dropIndex({
        queryRunner,
        schemaName,
        indexName: searchVectorIndex.name,
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
          asExpression: searchExpression,
        },
      ],
    });

    if (searchVectorIndex) {
      await this.workspaceSchemaManager.indexManager.createIndex({
        queryRunner,
        schemaName,
        tableName,
        index: {
          name: searchVectorIndex.name,
          columns: [SEARCH_VECTOR_FIELD.name],
          type: searchVectorIndex.indexType,
          isUnique: searchVectorIndex.isUnique,
          where: searchVectorIndex.indexWhereClause ?? undefined,
        },
      });
    }

    this.logger.log(
      `Regenerated search vector for ${objectMetadata.nameSingular} in workspace ${workspaceId}`,
    );
  }

  private getSearchVectorExpression(
    objectMetadata: ObjectMetadataEntity,
  ): string | undefined {
    if (objectMetadata.standardId) {
      const standardExpression =
        STANDARD_SEARCH_EXPRESSIONS[objectMetadata.standardId];

      if (standardExpression) {
        return standardExpression;
      }
    }

    if (objectMetadata.isCustom) {
      return this.computeCustomObjectSearchExpression(objectMetadata);
    }

    return undefined;
  }

  private computeCustomObjectSearchExpression(
    objectMetadata: ObjectMetadataEntity,
  ): string {
    const labelFieldMetadata = objectMetadata.fields.find(
      (field) => field.id === objectMetadata.labelIdentifierFieldMetadataId,
    );

    if (!labelFieldMetadata) {
      return getTsVectorColumnExpressionFromFields(
        SEARCH_FIELDS_FOR_CUSTOM_OBJECT,
      );
    }

    return getTsVectorColumnExpressionFromFields([
      {
        name: labelFieldMetadata.name,
        type: labelFieldMetadata.type as SearchableFieldType,
      },
    ]);
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
  } as const;

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
