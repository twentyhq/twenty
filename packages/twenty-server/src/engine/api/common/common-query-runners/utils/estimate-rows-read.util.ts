import { compositeTypeDefinitions, IndexType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { isRecordFilterEmpty } from 'src/engine/api/common/common-query-runners/utils/is-record-filter-empty.util';
import { getOptionalOrderByCasting } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/get-optional-order-by-casting.util';
import { resolveFilterKeyFieldMetadata } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/resolve-filter-key-field-metadata.util';
import { getEffectiveScanOrder } from 'src/engine/api/utils/get-effective-scan-order.utils';
import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

const POSTGRES_DEFAULT_EQUALITY_SELECTIVITY = 0.005;
const POSTGRES_DEFAULT_RANGE_SELECTIVITY = 1 / 3;

type IndexedColumn = {
  isUnique: boolean;
  relationTargetObjectMetadataId: string | null;
};

type EstimationContext = {
  recordCount: number;
  indexedColumnByName: Map<string, IndexedColumn>;
  fieldIdByName: Record<string, string>;
  fieldIdByJoinColumnName: Record<string, string>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  approximateRecordCountByTableName: Map<string, number>;
};

const getApproximateRecordCount = (
  flatObjectMetadata: FlatObjectMetadata,
  approximateRecordCountByTableName: Map<string, number>,
): number =>
  approximateRecordCountByTableName.get(
    computeObjectTargetTable(flatObjectMetadata),
  ) ?? 0;

const computeIndexLeadingColumn = (
  flatIndexMetadata: FlatIndexMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
): { name: string; relationTargetObjectMetadataId: string | null } | null => {
  const [leadingIndexField] = [
    ...flatIndexMetadata.flatIndexFieldMetadatas,
  ].sort((a, b) => a.order - b.order);

  if (!isDefined(leadingIndexField)) {
    return null;
  }

  const flatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: leadingIndexField.fieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
    return {
      name: computeMorphOrRelationFieldJoinColumnName({
        name: flatFieldMetadata.name,
      }),
      relationTargetObjectMetadataId:
        flatFieldMetadata.relationTargetObjectMetadataId,
    };
  }

  if (!isCompositeFieldMetadataType(flatFieldMetadata.type)) {
    return {
      name: flatFieldMetadata.name,
      relationTargetObjectMetadataId: null,
    };
  }

  const compositeProperty = compositeTypeDefinitions
    .get(flatFieldMetadata.type)
    ?.properties.find(
      (property) => property.name === leadingIndexField.subFieldName,
    );

  return isDefined(compositeProperty)
    ? {
        name: computeCompositeColumnName(flatFieldMetadata, compositeProperty),
        relationTargetObjectMetadataId: null,
      }
    : null;
};

const buildIndexedColumnByName = (
  flatObjectMetadata: FlatObjectMetadata,
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
): Map<string, IndexedColumn> => {
  const indexedColumnByName = new Map<string, IndexedColumn>([
    ['id', { isUnique: true, relationTargetObjectMetadataId: null }],
  ]);

  const fullBtreeIndexes = findManyFlatEntityByIdInFlatEntityMaps({
    flatEntityIds: flatObjectMetadata.indexMetadataIds,
    flatEntityMaps: flatIndexMaps,
  }).filter(
    (flatIndexMetadata) =>
      flatIndexMetadata.indexType === IndexType.BTREE &&
      !isDefined(flatIndexMetadata.indexWhereClause),
  );

  for (const flatIndexMetadata of fullBtreeIndexes) {
    const leadingColumn = computeIndexLeadingColumn(
      flatIndexMetadata,
      flatFieldMetadataMaps,
    );

    if (!isDefined(leadingColumn)) {
      continue;
    }

    const isSingleColumnUniqueIndex =
      flatIndexMetadata.isUnique &&
      flatIndexMetadata.flatIndexFieldMetadatas.length === 1;

    indexedColumnByName.set(leadingColumn.name, {
      isUnique:
        isSingleColumnUniqueIndex ||
        (indexedColumnByName.get(leadingColumn.name)?.isUnique ?? false),
      relationTargetObjectMetadataId:
        leadingColumn.relationTargetObjectMetadataId,
    });
  }

  return indexedColumnByName;
};

const estimateRowsMatchingOneValue = (
  indexedColumn: IndexedColumn,
  context: EstimationContext,
): number => {
  if (indexedColumn.isUnique) {
    return 1;
  }

  if (isDefined(indexedColumn.relationTargetObjectMetadataId)) {
    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: indexedColumn.relationTargetObjectMetadataId,
      flatEntityMaps: context.flatObjectMetadataMaps,
    });

    return (
      context.recordCount /
      (getApproximateRecordCount(
        targetFlatObjectMetadata,
        context.approximateRecordCountByTableName,
      ) || 1)
    );
  }

  return context.recordCount * POSTGRES_DEFAULT_EQUALITY_SELECTIVITY;
};

const estimateRowsReadForColumnCondition = (
  columnName: string,
  condition: Record<string, unknown>,
  context: EstimationContext,
): number => {
  const indexedColumn = context.indexedColumnByName.get(columnName);

  if (!isDefined(indexedColumn)) {
    return context.recordCount;
  }

  const [[operator, value]] = Object.entries(condition);

  switch (operator) {
    case 'eq':
    case 'eqStrict':
      return estimateRowsMatchingOneValue(indexedColumn, context);
    case 'in':
      return (
        (value as unknown[]).length *
        estimateRowsMatchingOneValue(indexedColumn, context)
      );
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
      return context.recordCount * POSTGRES_DEFAULT_RANGE_SELECTIVITY;
    default:
      return context.recordCount;
  }
};

const estimateRowsReadForFieldFilter = (
  filterKey: string,
  filterValue: Record<string, unknown>,
  context: EstimationContext,
): number => {
  const { fieldMetadata, isReferencedByFieldName } =
    resolveFilterKeyFieldMetadata({
      filterKey,
      fieldIdByName: context.fieldIdByName,
      fieldIdByJoinColumnName: context.fieldIdByJoinColumnName,
      flatFieldMetadataMaps: context.flatFieldMetadataMaps,
    });

  if (
    !isDefined(fieldMetadata) ||
    (isReferencedByFieldName &&
      isMorphOrRelationFlatFieldMetadata(fieldMetadata))
  ) {
    return context.recordCount;
  }

  if (!isCompositeFieldMetadataType(fieldMetadata.type)) {
    return estimateRowsReadForColumnCondition(filterKey, filterValue, context);
  }

  const compositeProperties =
    compositeTypeDefinitions.get(fieldMetadata.type)?.properties ?? [];

  return Math.min(
    ...Object.entries(filterValue).map(([subFieldName, subFieldCondition]) => {
      const compositeProperty = compositeProperties.find(
        (property) => property.name === subFieldName,
      );

      return isDefined(compositeProperty)
        ? estimateRowsReadForColumnCondition(
            computeCompositeColumnName(fieldMetadata, compositeProperty),
            subFieldCondition as Record<string, unknown>,
            context,
          )
        : context.recordCount;
    }),
  );
};

const estimateRowsReadForFilter = (
  filter: Partial<ObjectRecordFilter>,
  context: EstimationContext,
): number => {
  const rowsReadPerFilterEntry = Object.entries(filter).map(
    ([filterKey, filterValue]) => {
      const subFilters = (
        Array.isArray(filterValue) ? filterValue : [filterValue]
      ) as Partial<ObjectRecordFilter>[];

      switch (filterKey) {
        case 'and':
          return Math.min(
            ...subFilters.map((subFilter) =>
              estimateRowsReadForFilter(subFilter, context),
            ),
          );
        case 'or':
          return subFilters.reduce(
            (rowsRead, subFilter) =>
              rowsRead + estimateRowsReadForFilter(subFilter, context),
            0,
          );
        case 'not':
          return context.recordCount;
        default:
          return estimateRowsReadForFieldFilter(
            filterKey,
            filterValue as Record<string, unknown>,
            context,
          );
      }
    },
  );

  return Math.min(context.recordCount, ...rowsReadPerFilterEntry);
};

const computeOrderByLeafColumnName = (leaf: OrderByLeaf): string | null => {
  switch (leaf.kind) {
    case 'scalar':
      return leaf.path[0];
    case 'composite':
      return computeCompositeColumnName(
        leaf.fieldMetadata,
        leaf.compositeProperty,
      );
    case 'relation':
      return null;
  }
};

const isLeadingOrderServedByIndex = (
  orderByLeaves: OrderByLeaf[],
  indexedColumnByName: Map<string, IndexedColumn>,
): boolean => {
  const [leadingLeaf] = orderByLeaves;

  if (!isDefined(leadingLeaf)) {
    return true;
  }

  const columnName = computeOrderByLeafColumnName(leadingLeaf);
  const { isAscending, areNullsScannedLast } = getEffectiveScanOrder(
    leadingLeaf.direction,
    true,
  );
  const isBtreeScanOrder = isAscending === areNullsScannedLast;

  return (
    isDefined(columnName) &&
    indexedColumnByName.has(columnName) &&
    getOptionalOrderByCasting(leadingLeaf.fieldMetadata) === '' &&
    isBtreeScanOrder
  );
};

export const estimateRowsRead = ({
  filter,
  orderByLeaves,
  limit,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
  approximateRecordCountByTableName,
}: {
  filter: Partial<ObjectRecordFilter>;
  orderByLeaves: OrderByLeaf[];
  limit?: number;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  approximateRecordCountByTableName: Map<string, number>;
}): number => {
  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

  const context: EstimationContext = {
    recordCount: getApproximateRecordCount(
      flatObjectMetadata,
      approximateRecordCountByTableName,
    ),
    indexedColumnByName: buildIndexedColumnByName(
      flatObjectMetadata,
      flatIndexMaps,
      flatFieldMetadataMaps,
    ),
    fieldIdByName,
    fieldIdByJoinColumnName,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    approximateRecordCountByTableName,
  };

  if (isRecordFilterEmpty(filter)) {
    return isDefined(limit) &&
      isLeadingOrderServedByIndex(orderByLeaves, context.indexedColumnByName)
      ? Math.min(limit, context.recordCount)
      : context.recordCount;
  }

  return Math.ceil(estimateRowsReadForFilter(filter, context));
};
