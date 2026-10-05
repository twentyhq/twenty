import { isDefined } from 'twenty-shared/utils';

import { type RowsEstimationContext } from 'src/engine/api/common/common-query-runners/types/rows-estimation-context.type';
import { getOptionalOrderByCasting } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/get-optional-order-by-casting.util';
import { getEffectiveScanOrder } from 'src/engine/api/utils/get-effective-scan-order.utils';
import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';

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

export const isLeadingOrderServedByIndex = (
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
