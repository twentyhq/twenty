import { Injectable } from '@nestjs/common';

import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isDefined, isEmptyObject, isValidUuid } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import {
  type ConcurrencyLimiter,
  createConcurrencyLimiter,
} from 'src/engine/api/common/common-nested-relations-processor/utils/create-concurrency-limiter.util';
import { assignManyToOneRelationRecords } from 'src/engine/api/common/common-nested-relations-processor/utils/assign-many-to-one-relation-records.util';
import { assignOneToManyRelationRecords } from 'src/engine/api/common/common-nested-relations-processor/utils/assign-one-to-many-relation-records.util';
import { getUniqueRelationIds } from 'src/engine/api/common/common-nested-relations-processor/utils/get-unique-relation-ids.util';
import { getRelationSelectionEntries } from 'src/engine/api/common/utils/get-relation-selection-entries.util';
import {
  type CommonAggregatedValues,
  type CommonRelationAggregatedValues,
  type CommonRelationsAggregatedValues,
} from 'src/engine/api/common/types/common-aggregated-values.type';
import {
  type CommonRelationSelection,
  type CommonSelection,
} from 'src/engine/api/common/types/common-selection.type';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { CommonQueryParser } from 'src/engine/api/common/common-query-parsers/common-query.parser';
import { ProcessAggregateHelper } from 'src/engine/api/common/utils/process-aggregate.helper';
import { buildColumnsToSelect } from 'src/engine/api/common/utils/build-columns-to-select';
import { getTargetObjectMetadataOrThrow } from 'src/engine/api/common/utils/get-target-object-metadata.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import {
  buildFieldMapsFromFlatObjectMetadata,
  type FieldMapsForObject,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

const EMPTY_RELATION_SENTINEL_RECORD_ID =
  '00000000-0000-0000-0000-000000000000';
const NESTED_RELATION_QUERY_MAX_CONCURRENCY = 4;

type ProcessNestedRelationsArgs<T extends ObjectRecord = ObjectRecord> = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  parentObjectMetadataItem: FlatObjectMetadata;
  parentObjectRecords: T[];
  selection: CommonSelection;
  limit: number;
  authContext: WorkspaceAuthContext;
  useReplica?: boolean;
  repository?: WorkspaceRepository;
};

@Injectable()
export class ProcessNestedRelationsHelper {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  public async processNestedRelations<T extends ObjectRecord = ObjectRecord>(
    args: ProcessNestedRelationsArgs<T>,
  ): Promise<CommonRelationsAggregatedValues> {
    return await this.processNestedRelationsWithLimiter(
      args,
      createConcurrencyLimiter(NESTED_RELATION_QUERY_MAX_CONCURRENCY),
    );
  }

  private async processNestedRelationsWithLimiter<
    T extends ObjectRecord = ObjectRecord,
  >(
    {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      parentObjectMetadataItem,
      parentObjectRecords,
      selection,
      limit,
      authContext,
      useReplica = false,
      repository,
    }: ProcessNestedRelationsArgs<T>,
    relationQueryLimiter: ConcurrencyLimiter,
  ): Promise<CommonRelationsAggregatedValues> {
    const processRelationTasks = getRelationSelectionEntries(selection).map(
      async ({ key, relationSelection }) =>
        [
          key,
          await this.processRelation({
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            parentObjectMetadataItem,
            parentObjectRecords,
            key,
            relationSelection,
            limit,
            authContext,
            useReplica,
            repository,
            relationQueryLimiter,
          }),
        ] as const,
    );

    return Object.fromEntries(await Promise.all(processRelationTasks));
  }

  private async processRelation<T extends ObjectRecord = ObjectRecord>({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    parentObjectMetadataItem,
    parentObjectRecords,
    key,
    relationSelection,
    limit,
    authContext,
    useReplica,
    repository,
    relationQueryLimiter,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    parentObjectMetadataItem: FlatObjectMetadata;
    parentObjectRecords: T[];
    key: string;
    relationSelection: CommonRelationSelection;
    limit: number;
    authContext: WorkspaceAuthContext;
    useReplica: boolean;
    repository?: WorkspaceRepository;
    relationQueryLimiter: ConcurrencyLimiter;
  }): Promise<CommonRelationAggregatedValues> {
    const emptyAggregatedValues: CommonRelationAggregatedValues = {
      valuesByParentRecordId: {},
      relations: {},
    };
    const relationFieldName = relationSelection.fieldName;

    const fieldMaps = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      parentObjectMetadataItem,
    );

    const sourceFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMaps.fieldIdByName[relationFieldName],
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!sourceFieldMetadata) {
      return emptyAggregatedValues;
    }

    if (
      !isFieldMetadataEntityOfType(
        sourceFieldMetadata,
        FieldMetadataType.RELATION,
      ) &&
      !isFieldMetadataEntityOfType(
        sourceFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      )
    ) {
      return emptyAggregatedValues;
    }

    if (!sourceFieldMetadata.settings) {
      throw new CommonQueryRunnerException(
        `Relation settings not found for field ${relationFieldName}`,
        CommonQueryRunnerExceptionCode.RELATION_SETTINGS_NOT_FOUND,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const relationType = sourceFieldMetadata.settings.relationType;
    const { targetRelationName, targetObjectMetadata, targetRelation } =
      this.getTargetObjectMetadata({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        parentObjectMetadataItem,
        sourceFieldName: relationFieldName,
        fieldMaps,
      });

    const targetObjectRepository = repository
      ? repository.getRepositoryForObjectMetadataId(targetObjectMetadata.id)
      : this.workspaceOrmManager.getRepository(
          targetObjectMetadata.nameSingular,
          { useReplica },
        );

    const targetObjectNameSingular = targetObjectMetadata.nameSingular;

    // A joined relation to such records reads as empty, so a nested one does too instead of failing the parent
    if (await targetObjectRepository.isReadDisabled()) {
      this.assignRelationResults({
        parentRecords: parentObjectRecords,
        relationResults: [],
        key,
        relatedRecordJoinColumnName: 'id',
        parentRecordJoinColumnName: computeMorphOrRelationFieldJoinColumnName({
          name: relationFieldName,
        }),
        relationType,
        selectedColumns: relationSelection.selection.columns,
      });

      return emptyAggregatedValues;
    }

    let targetObjectQueryBuilder = targetObjectRepository.createQueryBuilder(
      targetObjectNameSingular,
    );

    const columnsToSelect: Record<string, boolean> = buildColumnsToSelect({
      selection: relationSelection.selection,
      flatObjectMetadata: targetObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (relationType === RelationType.MANY_TO_ONE) {
      columnsToSelect.deletedAt = true;
      targetObjectQueryBuilder = targetObjectQueryBuilder.withDeleted();
    }

    targetObjectQueryBuilder = targetObjectQueryBuilder.setFindOptions({
      select: columnsToSelect,
    });

    const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: relationFieldName,
    });

    const relationIds = await this.findRelationIds({
      parentObjectMetadataItem,
      parentObjectRecords,
      relationType,
      joinColumnName,
      sourceFieldName: relationFieldName,
      repository,
      useReplica,
    });

    if (
      relationType === RelationType.ONE_TO_MANY &&
      !isDefined(targetRelationName)
    ) {
      throw new CommonQueryRunnerException(
        `Could not resolve target relation for one-to-many field ${relationFieldName}`,
        CommonQueryRunnerExceptionCode.RELATION_TARGET_OBJECT_METADATA_NOT_FOUND,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const fieldMetadataTargetRelationColumnName =
      computeMorphOrRelationFieldJoinColumnName({
        name:
          targetRelation &&
          isFieldMetadataEntityOfType(
            targetRelation,
            FieldMetadataType.MORPH_RELATION,
          )
            ? targetRelation.name
            : (targetRelationName as string),
      });

    const { relationResults, valuesByParentRecordId } =
      await relationQueryLimiter(() =>
        this.findRelations({
          referenceQueryBuilder: targetObjectQueryBuilder,
          targetObjectRepository,
          column:
            relationType === RelationType.ONE_TO_MANY
              ? `"${fieldMetadataTargetRelationColumnName}"`
              : 'id',
          ids: relationIds,
          relationType,
          parentRecordsCount: parentObjectRecords.length,
          targetObjectNameSingular,
          relationSelection,
          relationQueryParser: new CommonQueryParser({
            flatObjectMetadata: targetObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          }),
          perParentLimit: Math.min(relationSelection.first ?? limit, limit),
        }),
      );

    const nestedRelationsAggregatedValues =
      await this.processNestedRelationsWithLimiter(
        {
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          parentObjectMetadataItem: targetObjectMetadata,
          parentObjectRecords: relationResults as ObjectRecord[],
          selection: relationSelection.selection,
          limit,
          authContext,
          useReplica,
          repository,
        },
        relationQueryLimiter,
      );

    // After the nested load: a to-one relation is assigned as a copy, so nested rows must already be on it
    this.assignRelationResults({
      parentRecords: parentObjectRecords,
      relationResults,
      key,
      relatedRecordJoinColumnName:
        relationType === RelationType.ONE_TO_MANY
          ? `${fieldMetadataTargetRelationColumnName}`
          : 'id',
      parentRecordJoinColumnName: joinColumnName,
      relationType,
      selectedColumns: relationSelection.selection.columns,
    });

    return {
      valuesByParentRecordId,
      relations: nestedRelationsAggregatedValues,
    };
  }

  private async findRelationIds({
    parentObjectMetadataItem,
    parentObjectRecords,
    relationType,
    joinColumnName,
    sourceFieldName,
    repository,
    useReplica,
  }: {
    parentObjectMetadataItem: Pick<FlatObjectMetadata, 'id' | 'nameSingular'>;
    parentObjectRecords: ObjectRecord[];
    relationType: RelationType;
    joinColumnName: string;
    sourceFieldName: string;
    repository?: WorkspaceRepository;
    useReplica: boolean;
  }): Promise<string[]> {
    if (relationType !== RelationType.ONE_TO_MANY) {
      return getUniqueRelationIds({
        records: parentObjectRecords,
        idField: joinColumnName,
      });
    }

    const parentObjectRepository = isDefined(repository)
      ? repository.getRepositoryForObjectMetadataId(parentObjectMetadataItem.id)
      : this.workspaceOrmManager.getRepository(
          parentObjectMetadataItem.nameSingular,
          { useReplica },
        );

    return parentObjectRepository.filterRecordIdsWithReadableRelation({
      recordIds: getUniqueRelationIds({
        records: parentObjectRecords,
        idField: 'id',
      }),
      relationFieldName: sourceFieldName,
    });
  }

  private getTargetObjectMetadata({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    parentObjectMetadataItem,
    sourceFieldName,
    fieldMaps,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    parentObjectMetadataItem: FlatObjectMetadata;
    sourceFieldName: string;
    fieldMaps: FieldMapsForObject;
  }) {
    const targetFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMaps.fieldIdByName[sourceFieldName],
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!targetFieldMetadata) {
      throw new CommonQueryRunnerException(
        `Field ${sourceFieldName} not found on object ${parentObjectMetadataItem.nameSingular}`,
        CommonQueryRunnerExceptionCode.FIELD_NOT_FOUND,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const targetObjectMetadata = getTargetObjectMetadataOrThrow(
      targetFieldMetadata,
      flatObjectMetadataMaps,
    );

    if (
      !targetFieldMetadata.relationTargetObjectMetadataId ||
      !targetFieldMetadata.relationTargetFieldMetadataId
    ) {
      throw new CommonQueryRunnerException(
        `Relation target object metadata id or field metadata id not found for field ${sourceFieldName}`,
        CommonQueryRunnerExceptionCode.RELATION_TARGET_OBJECT_METADATA_NOT_FOUND,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const targetRelation = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: targetFieldMetadata.relationTargetFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    const targetRelationName = targetRelation?.name;

    return { targetRelationName, targetObjectMetadata, targetRelation };
  }

  private async findRelations({
    referenceQueryBuilder,
    targetObjectRepository,
    column,
    ids,
    relationType,
    perParentLimit,
    parentRecordsCount,
    targetObjectNameSingular,
    relationSelection,
    relationQueryParser,
  }: {
    referenceQueryBuilder: WorkspaceSelectQueryBuilder;
    targetObjectRepository: WorkspaceRepository;
    column: string;
    // oxlint-disable-next-line typescript/no-explicit-any
    ids: any[];
    relationType: RelationType;
    perParentLimit: number;
    parentRecordsCount: number;
    targetObjectNameSingular: string;
    relationSelection: Pick<
      CommonRelationSelection,
      'selection' | 'filter' | 'orderBy'
    >;
    relationQueryParser: CommonQueryParser;
  }): Promise<{
    // oxlint-disable-next-line typescript/no-explicit-any
    relationResults: any[];
    valuesByParentRecordId: CommonRelationAggregatedValues['valuesByParentRecordId'];
  }> {
    if (ids.length === 0) {
      return { relationResults: [], valuesByParentRecordId: {} };
    }

    // Qualified so a relation join added by orderBy or filter can't make it ambiguous
    const qualifiedColumn = `"${targetObjectNameSingular}".${column}`;
    const columnWithoutQuotes = column.replace(/["']/g, '');
    const { aggregates } = relationSelection.selection;
    let valuesByParentRecordId: CommonRelationAggregatedValues['valuesByParentRecordId'] =
      {};

    if (!isEmptyObject(aggregates)) {
      const aggregateQueryBuilder = referenceQueryBuilder.clone();

      this.applyNestedRelationFilterToBuilder({
        queryBuilder: aggregateQueryBuilder,
        targetObjectNameSingular,
        relationSelection,
        relationQueryParser,
      });

      ProcessAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
        selectedAggregatedFields: aggregates,
        queryBuilder: aggregateQueryBuilder,
        objectMetadataNameSingular: targetObjectNameSingular,
      });

      const aggregatedFieldsValues = await aggregateQueryBuilder
        .addSelect(qualifiedColumn, columnWithoutQuotes)
        .andWhere(`${qualifiedColumn} IN (:...ids)`, { ids })
        .groupBy(qualifiedColumn)
        .getRawMany<CommonAggregatedValues>();

      valuesByParentRecordId = Object.fromEntries(
        aggregatedFieldsValues.map(
          ({ [columnWithoutQuotes]: parentRecordId, ...values }) => [
            String(parentRecordId),
            values,
          ],
        ),
      );
    }

    const queryBuilderOptions = referenceQueryBuilder.getFindOptions();

    const findOptionsWithJoinColumn = {
      ...queryBuilderOptions,
      select: { ...queryBuilderOptions.select, [columnWithoutQuotes]: true },
    };

    if (relationType !== RelationType.ONE_TO_MANY) {
      const result = await referenceQueryBuilder
        .setFindOptions(findOptionsWithJoinColumn)
        .where(`${qualifiedColumn} IN (:...ids)`, { ids })
        .take(perParentLimit * parentRecordsCount)
        .getMany();

      return { relationResults: result, valuesByParentRecordId };
    }

    const allowedRelationRecordIds =
      await this.findRelationRecordIdsLimitedPerParent({
        targetObjectRepository,
        targetObjectNameSingular,
        column,
        ids,
        perParentLimit,
        relationSelection,
        relationQueryParser,
      });

    const recordIdsToHydrate =
      allowedRelationRecordIds.length > 0
        ? allowedRelationRecordIds
        : [EMPTY_RELATION_SENTINEL_RECORD_ID];

    const hydrationQueryBuilder = referenceQueryBuilder
      .setFindOptions(findOptionsWithJoinColumn)
      .where(`"${targetObjectNameSingular}"."id" IN (:...recordIdsToHydrate)`, {
        recordIdsToHydrate,
      });

    // The id query may have kept soft-deleted records the filter asked for
    if (isDefined(relationSelection.filter)) {
      relationQueryParser.applyDeletedAtToBuilder({
        queryBuilder: hydrationQueryBuilder,
        recordFilter: relationSelection.filter,
      });
    }

    if (isDefined(relationSelection.orderBy)) {
      relationQueryParser.applyOrderToBuilder({
        queryBuilder: hydrationQueryBuilder,
        orderBy: relationSelection.orderBy,
        objectNameSingular: targetObjectNameSingular,
      });
    }

    const result = await hydrationQueryBuilder.getMany();

    return { relationResults: result, valuesByParentRecordId };
  }

  private async findRelationRecordIdsLimitedPerParent({
    targetObjectRepository,
    targetObjectNameSingular,
    column,
    ids,
    perParentLimit,
    relationSelection,
    relationQueryParser,
  }: {
    targetObjectRepository: WorkspaceRepository;
    targetObjectNameSingular: string;
    column: string;
    ids: string[];
    perParentLimit: number;
    relationSelection: Pick<CommonRelationSelection, 'filter' | 'orderBy'>;
    relationQueryParser: CommonQueryParser;
  }): Promise<string[]> {
    const sanitizedIds = ids.filter(isValidUuid);

    if (sanitizedIds.length === 0) {
      return [];
    }

    const perParentRecordIdsQueryBuilder = targetObjectRepository
      .createQueryBuilder(targetObjectNameSingular)
      .select(`"${targetObjectNameSingular}"."id"`, 'id');

    this.applyNestedRelationFilterToBuilder({
      queryBuilder: perParentRecordIdsQueryBuilder,
      targetObjectNameSingular,
      relationSelection,
      relationQueryParser,
    });

    perParentRecordIdsQueryBuilder.andWhere(
      `"${targetObjectNameSingular}".${column} = "lateralParents"."parentId"`,
    );

    if (isDefined(relationSelection.orderBy)) {
      relationQueryParser.applyOrderToBuilder({
        queryBuilder: perParentRecordIdsQueryBuilder,
        orderBy: relationSelection.orderBy,
        objectNameSingular: targetObjectNameSingular,
      });
    }

    await perParentRecordIdsQueryBuilder.applyRowLevelPermissions();

    const perParentRecordIdsSql = `${perParentRecordIdsQueryBuilder.getQuery()} LIMIT ${Number(perParentLimit)}`;

    const parentValues = sanitizedIds.map((id) => `('${id}'::uuid)`).join(', ');

    const lateralSql =
      `SELECT "limited_relation_records"."id" AS "id" FROM (` +
      `SELECT "lateralRecords"."id" AS "id" ` +
      `FROM (VALUES ${parentValues}) AS "lateralParents"("parentId") ` +
      `CROSS JOIN LATERAL (${perParentRecordIdsSql}) AS "lateralRecords"` +
      `) AS "limited_relation_records"`;

    const limitedRecords = await targetObjectRepository.executeRaw<{
      id: string;
    }>(lateralSql, perParentRecordIdsQueryBuilder.getParameters());

    return limitedRecords.map((limitedRecord) => limitedRecord.id);
  }

  private applyNestedRelationFilterToBuilder({
    queryBuilder,
    targetObjectNameSingular,
    relationSelection,
    relationQueryParser,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    targetObjectNameSingular: string;
    relationSelection: Pick<CommonRelationSelection, 'filter'>;
    relationQueryParser: CommonQueryParser;
  }): void {
    if (!isDefined(relationSelection.filter)) {
      return;
    }

    relationQueryParser.applyFilterToBuilder({
      queryBuilder,
      objectNameSingular: targetObjectNameSingular,
      recordFilter: relationSelection.filter,
    });
    relationQueryParser.applyDeletedAtToBuilder({
      queryBuilder,
      recordFilter: relationSelection.filter,
    });
  }

  private assignRelationResults({
    parentRecords,
    relationResults,
    key,
    relatedRecordJoinColumnName,
    parentRecordJoinColumnName,
    relationType,
    selectedColumns,
  }: {
    parentRecords: ObjectRecord[];
    // oxlint-disable-next-line typescript/no-explicit-any
    relationResults: any[];
    key: string;
    relatedRecordJoinColumnName: string;
    parentRecordJoinColumnName: string;
    relationType: RelationType;
    selectedColumns: CommonSelection['columns'];
  }): void {
    if (relationType === RelationType.ONE_TO_MANY) {
      assignOneToManyRelationRecords({
        parentRecords,
        relationRecords: relationResults,
        sourceFieldName: key,
        relatedRecordJoinColumnName,
      });
    } else {
      assignManyToOneRelationRecords({
        parentRecords,
        relationRecords: relationResults,
        sourceFieldName: key,
        parentRecordJoinColumnName,
        selectedColumns,
      });
    }
  }
}
