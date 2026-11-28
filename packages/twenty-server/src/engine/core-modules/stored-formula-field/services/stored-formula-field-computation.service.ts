import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import isEqual from 'lodash.isequal';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { StoredFormulaFieldDirtyRecordService } from 'src/engine/core-modules/stored-formula-field/services/stored-formula-field-dirty-record.service';
import { STORED_FORMULA_FIELD_RECORDS_PER_RUN } from 'src/engine/core-modules/stored-formula-field/constants/stored-formula-field-records-per-run.constant';
import { STORED_FORMULA_FIELD_RECOMPUTE_BATCH_SIZE } from 'src/engine/core-modules/stored-formula-field/constants/stored-formula-field-recompute-batch-size.constant';
import {
  buildStoredFormulaColumnExpressions,
  type StoredFormulaComputationPass,
} from 'src/engine/core-modules/stored-formula-field/utils/build-stored-formula-column-expressions.util';
import { buildStoredFormulaRecordUpdate } from 'src/engine/core-modules/stored-formula-field/utils/build-stored-formula-record-update.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { quoteColumn } from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { COMPUTED_COLUMN_RECORD_ALIAS } from 'src/engine/twenty-orm/table-shape/constants/computed-column-record-alias.constant';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const RECORD_ID_COLUMN = quoteColumn(COMPUTED_COLUMN_RECORD_ALIAS, 'id');

type RecomputeRecordsParameters = {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular'>;
  passes: StoredFormulaComputationPass[];
  recordIds: string[];
  shouldSkipEventEmission: boolean;
};

type RecomputeRecordsBatchParameters = Omit<
  RecomputeRecordsParameters,
  'passes'
> &
  StoredFormulaComputationPass;

@Injectable()
export class StoredFormulaFieldComputationService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly storedFormulaFieldDirtyRecordService: StoredFormulaFieldDirtyRecordService,
  ) {}

  async recomputeStoredFormulaFieldsOfRecords({
    workspaceId,
    objectMetadataId,
    recordIds,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const resolvedColumnExpressions = this.resolveColumnExpressions({
        workspaceId,
        objectMetadataId,
      });

      if (!isDefined(resolvedColumnExpressions)) {
        return;
      }

      await this.recomputeRecordsInBatches({
        ...resolvedColumnExpressions,
        recordIds,
        shouldSkipEventEmission: false,
      });
    }, buildSystemAuthContext(workspaceId));
  }

  // Returns the id to resume after, or null once every record of the object is computed
  async recomputeStoredFormulaFieldsOfNextRecords({
    workspaceId,
    objectMetadataId,
    formulaFieldMetadataIds,
    afterRecordId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    formulaFieldMetadataIds: string[];
    afterRecordId: string | null;
  }): Promise<string | null> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const resolvedColumnExpressions = this.resolveColumnExpressions({
        workspaceId,
        objectMetadataId,
        formulaFieldMetadataIds,
      });

      if (!isDefined(resolvedColumnExpressions)) {
        return null;
      }

      const recordIdsQueryBuilder = this.workspaceOrmManager
        .getRepositoryWithoutPermissionChecks(
          resolvedColumnExpressions.flatObjectMetadata.nameSingular,
        )
        .createQueryBuilder(COMPUTED_COLUMN_RECORD_ALIAS)
        .withStoredColumnsOnly()
        .select(`${RECORD_ID_COLUMN}`, 'id')
        .orderBy(`${RECORD_ID_COLUMN}`, 'ASC')
        .limit(STORED_FORMULA_FIELD_RECORDS_PER_RUN);

      if (isDefined(afterRecordId)) {
        recordIdsQueryBuilder.where(`${RECORD_ID_COLUMN} > :afterRecordId`, {
          afterRecordId,
        });
      }

      const recordIds = (
        await recordIdsQueryBuilder.getRawMany<{ id: string }>()
      ).map(({ id }) => id);

      const writtenRecordIds = await this.recomputeRecordsInBatches({
        ...resolvedColumnExpressions,
        recordIds,
        // A full pass would otherwise fire an update event, webhook and workflow per record
        shouldSkipEventEmission: true,
      });

      // A live recompute may have written a newer value meanwhile: re-checking writes only if one was overwritten
      await this.storedFormulaFieldDirtyRecordService.markRecordsDirty({
        workspaceId,
        objectMetadataId,
        recordIds: writtenRecordIds,
      });

      const hasMoreRecords =
        recordIds.length === STORED_FORMULA_FIELD_RECORDS_PER_RUN;

      if (!hasMoreRecords) {
        return null;
      }

      return recordIds[recordIds.length - 1];
    }, buildSystemAuthContext(workspaceId));
  }

  // Pages through the records pointing to the given ones, so a widely looked-up record never loads them all
  async markRecordsDirtyByJoinColumnValues({
    workspaceId,
    objectMetadataId,
    joinColumnName,
    joinColumnValues,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    joinColumnName: string;
    joinColumnValues: string[];
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: objectMetadataId,
        flatEntityMaps: getWorkspaceContext().flatObjectMetadataMaps,
      });

      if (
        !isDefined(flatObjectMetadata) ||
        !isNonEmptyArray(joinColumnValues)
      ) {
        return;
      }

      const recordRepository =
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks(
          flatObjectMetadata.nameSingular,
        );
      let afterRecordId: string | undefined;

      while (true) {
        const recordIdsQueryBuilder = recordRepository
          .createQueryBuilder(COMPUTED_COLUMN_RECORD_ALIAS)
          .withStoredColumnsOnly()
          .select(RECORD_ID_COLUMN, 'id')
          .where(
            `${quoteColumn(COMPUTED_COLUMN_RECORD_ALIAS, joinColumnName)} IN (:...joinColumnValues)`,
            { joinColumnValues },
          )
          .orderBy(RECORD_ID_COLUMN, 'ASC')
          .limit(STORED_FORMULA_FIELD_RECORDS_PER_RUN);

        if (isDefined(afterRecordId)) {
          recordIdsQueryBuilder.andWhere(
            `${RECORD_ID_COLUMN} > :afterRecordId`,
            {
              afterRecordId,
            },
          );
        }

        const recordIds = (
          await recordIdsQueryBuilder.getRawMany<{ id: string }>()
        ).map(({ id }) => id);

        await this.storedFormulaFieldDirtyRecordService.markRecordsDirty({
          workspaceId,
          objectMetadataId,
          recordIds,
        });

        if (recordIds.length < STORED_FORMULA_FIELD_RECORDS_PER_RUN) {
          return;
        }

        afterRecordId = recordIds[recordIds.length - 1];
      }
    }, buildSystemAuthContext(workspaceId));
  }

  private resolveColumnExpressions({
    workspaceId,
    objectMetadataId,
    formulaFieldMetadataIds,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    formulaFieldMetadataIds?: string[];
  }):
    | {
        flatObjectMetadata: FlatObjectMetadata;
        passes: StoredFormulaComputationPass[];
      }
    | undefined {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      getWorkspaceContext();
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return undefined;
    }

    const passes = buildStoredFormulaColumnExpressions({
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      schemaName: getWorkspaceSchemaName(workspaceId),
      formulaFieldMetadataIds,
    });

    return isNonEmptyArray(passes) ? { flatObjectMetadata, passes } : undefined;
  }

  private async recomputeRecordsInBatches({
    recordIds,
    passes,
    ...batchParameters
  }: RecomputeRecordsParameters): Promise<string[]> {
    const writtenRecordIds = new Set<string>();

    for (const pass of passes) {
      for (const recordIdsBatch of chunk(
        recordIds,
        STORED_FORMULA_FIELD_RECOMPUTE_BATCH_SIZE,
      )) {
        (
          await this.recomputeRecordsBatch({
            ...batchParameters,
            ...pass,
            recordIds: recordIdsBatch,
          })
        ).forEach((recordId) => writtenRecordIds.add(recordId));
      }
    }

    return [...writtenRecordIds];
  }

  private async recomputeRecordsBatch({
    flatObjectMetadata,
    columnExpressions,
    lookupJoins,
    recordIds,
    shouldSkipEventEmission,
  }: RecomputeRecordsBatchParameters): Promise<string[]> {
    const recordRepository =
      this.workspaceOrmManager.getRepositoryWithoutPermissionChecks(
        flatObjectMetadata.nameSingular,
        { shouldSkipEventEmission },
      );
    const valuesQueryBuilder = recordRepository
      .createQueryBuilder(COMPUTED_COLUMN_RECORD_ALIAS)
      .withStoredColumnsOnly()
      .select(RECORD_ID_COLUMN, 'id')
      .where(`${RECORD_ID_COLUMN} IN (:...recordIds)`, { recordIds });

    lookupJoins.forEach(({ relationFieldName, alias }) =>
      valuesQueryBuilder.leftJoin(
        `${COMPUTED_COLUMN_RECORD_ALIAS}.${relationFieldName}`,
        alias,
      ),
    );

    columnExpressions.forEach(({ columnName, expression }, columnIndex) =>
      valuesQueryBuilder
        .addSelect(
          quoteColumn(COMPUTED_COLUMN_RECORD_ALIAS, columnName),
          `stored${columnIndex}`,
        )
        .addSelect(expression, `value${columnIndex}`),
    );

    // Compared here rather than in SQL, so each expression is computed once per record
    const staleRows = (
      await valuesQueryBuilder.getRawMany<
        { id: string } & Record<string, unknown>
      >()
    ).filter((row) =>
      columnExpressions.some(
        (_, columnIndex) =>
          !isEqual(row[`stored${columnIndex}`], row[`value${columnIndex}`]),
      ),
    );

    if (!isNonEmptyArray(staleRows)) {
      return [];
    }

    await recordRepository.updateMany(
      staleRows.map((staleRow) => ({
        criteria: staleRow.id,
        partialEntity: buildStoredFormulaRecordUpdate({
          columnExpressions,
          values: columnExpressions.map(
            (_, columnIndex) => staleRow[`value${columnIndex}`],
          ),
        }),
      })),
    );

    return staleRows.map(({ id }) => id);
  }
}
