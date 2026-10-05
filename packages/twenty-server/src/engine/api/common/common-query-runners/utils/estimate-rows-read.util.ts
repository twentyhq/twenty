import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type RowsEstimationContext } from 'src/engine/api/common/common-query-runners/types/rows-estimation-context.type';
import { estimateRowsReadForColumnCondition } from 'src/engine/api/common/common-query-runners/utils/estimate-rows-read-for-column-condition.util';
import { isRecordFilterEmpty } from 'src/engine/api/common/common-query-runners/utils/is-record-filter-empty.util';
import { getOptionalOrderByCasting } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/get-optional-order-by-casting.util';
import { resolveFilterKeyFieldMetadata } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/resolve-filter-key-field-metadata.util';
import { getEffectiveScanOrder } from 'src/engine/api/utils/get-effective-scan-order.utils';
import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

const estimateRowsReadForFieldFilter = (
  filterKey: string,
  filterValue: Record<string, unknown>,
  context: RowsEstimationContext,
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
  context: RowsEstimationContext,
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
  context: RowsEstimationContext,
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
    context.indexedColumnByName.has(columnName) &&
    getOptionalOrderByCasting(leadingLeaf.fieldMetadata) === '' &&
    isBtreeScanOrder
  );
};

export const estimateRowsRead = ({
  filter,
  orderByLeaves = [],
  limit,
  context,
}: {
  filter: Partial<ObjectRecordFilter>;
  orderByLeaves?: OrderByLeaf[];
  limit?: number;
  context: RowsEstimationContext;
}): number => {
  if (isRecordFilterEmpty(filter)) {
    return isDefined(limit) &&
      isLeadingOrderServedByIndex(orderByLeaves, context)
      ? Math.min(limit, context.recordCount)
      : context.recordCount;
  }

  return Math.ceil(estimateRowsReadForFilter(filter, context));
};
