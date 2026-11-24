import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { STORED_FORMULA_FIELD_RECOMPUTE_BATCH_SIZE } from 'src/engine/core-modules/stored-formula-field/constants/stored-formula-field-recompute-batch-size.constant';
import { type StoredFormulaColumnExpression } from 'src/engine/core-modules/stored-formula-field/types/stored-formula-column-expression.type';
import { buildStoredFormulaColumnExpressions } from 'src/engine/core-modules/stored-formula-field/utils/build-stored-formula-column-expressions.util';
import { buildStoredFormulaRecordUpdate } from 'src/engine/core-modules/stored-formula-field/utils/build-stored-formula-record-update.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { COMPUTED_COLUMN_RECORD_ALIAS } from 'src/engine/twenty-orm/table-shape/constants/computed-column-record-alias.constant';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const RECORD_ALIAS = escapeIdentifier(COMPUTED_COLUMN_RECORD_ALIAS);

@Injectable()
export class StoredFormulaFieldComputationService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

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

      for (const recordIdsBatch of chunk(
        recordIds,
        STORED_FORMULA_FIELD_RECOMPUTE_BATCH_SIZE,
      )) {
        await this.recomputeRecordsBatch({
          ...resolvedColumnExpressions,
          recordIds: recordIdsBatch,
          shouldSkipEventEmission: false,
        });
      }
    }, buildSystemAuthContext(workspaceId));
  }

  // Returns the id to resume after, or null once every record of the object is computed
  async recomputeStoredFormulaFieldsOfNextRecords({
    workspaceId,
    objectMetadataId,
    formulaFieldMetadataIds,
    afterRecordId,
    batchCount,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    formulaFieldMetadataIds: string[];
    afterRecordId: string | null;
    batchCount: number;
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
        .select(`${RECORD_ALIAS}."id"`, 'id')
        .orderBy(`${RECORD_ALIAS}."id"`, 'ASC')
        .limit(STORED_FORMULA_FIELD_RECOMPUTE_BATCH_SIZE * batchCount);

      if (isDefined(afterRecordId)) {
        recordIdsQueryBuilder.where(`${RECORD_ALIAS}."id" > :afterRecordId`, {
          afterRecordId,
        });
      }

      const recordIds = (
        await recordIdsQueryBuilder.getRawMany<{ id: string }>()
      ).map(({ id }) => id);

      for (const recordIdsBatch of chunk(
        recordIds,
        STORED_FORMULA_FIELD_RECOMPUTE_BATCH_SIZE,
      )) {
        await this.recomputeRecordsBatch({
          ...resolvedColumnExpressions,
          recordIds: recordIdsBatch,
          // A full pass would otherwise fire an update event, webhook and workflow per record
          shouldSkipEventEmission: true,
        });
      }

      return recordIds.length ===
        STORED_FORMULA_FIELD_RECOMPUTE_BATCH_SIZE * batchCount
        ? recordIds[recordIds.length - 1]
        : null;
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
        columnExpressions: StoredFormulaColumnExpression[];
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

    const columnExpressions = buildStoredFormulaColumnExpressions({
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      schemaName: getWorkspaceSchemaName(workspaceId),
      formulaFieldMetadataIds,
    });

    return isNonEmptyArray(columnExpressions)
      ? { flatObjectMetadata, columnExpressions }
      : undefined;
  }

  // Only the records whose stored value differs are written, so an unchanged value emits no event
  private async recomputeRecordsBatch({
    flatObjectMetadata,
    columnExpressions,
    recordIds,
    shouldSkipEventEmission,
  }: {
    flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular'>;
    columnExpressions: StoredFormulaColumnExpression[];
    recordIds: string[];
    shouldSkipEventEmission: boolean;
  }): Promise<void> {
    const recordRepository =
      this.workspaceOrmManager.getRepositoryWithoutPermissionChecks(
        flatObjectMetadata.nameSingular,
        { shouldSkipEventEmission },
      );
    const staleValuesQueryBuilder = recordRepository
      .createQueryBuilder(COMPUTED_COLUMN_RECORD_ALIAS)
      .withStoredColumnsOnly()
      .select(`${RECORD_ALIAS}."id"`, 'id')
      .where(`${RECORD_ALIAS}."id" IN (:...recordIds)`, { recordIds })
      .andWhere(
        `(${columnExpressions
          .map(
            ({ columnName, expression }) =>
              `${RECORD_ALIAS}.${escapeIdentifier(columnName)} IS DISTINCT FROM ${expression}`,
          )
          .join(' OR ')})`,
      );

    columnExpressions.forEach(({ expression }, columnIndex) =>
      staleValuesQueryBuilder.addSelect(expression, `value${columnIndex}`),
    );

    const staleRows = await staleValuesQueryBuilder.getRawMany<
      { id: string } & Record<string, unknown>
    >();

    if (!isNonEmptyArray(staleRows)) {
      return;
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
  }
}
