import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeDateTimeCursorValueAlias } from 'src/engine/api/utils/compute-date-time-cursor-value-alias.util';
import { computeOrderByLeafColumn } from 'src/engine/api/utils/compute-order-by-leaf-column.util';
import {
  checkIfLeafCanCarryCursorValue,
  type OrderByLeaf,
} from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { quoteColumn } from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';

type DateTimeCursorValueSelect = {
  expression: string;
  alias: string;
};

// node-postgres parses timestamptz into a JS Date, which drops the microseconds ORDER BY sorts on
export const buildDateTimeCursorValueSelects = ({
  orderByLeaves,
  objectNameSingular,
}: {
  orderByLeaves: OrderByLeaf[];
  objectNameSingular: string;
}): DateTimeCursorValueSelect[] =>
  orderByLeaves.filter(checkIfLeafCanCarryCursorValue).flatMap((leaf) => {
    const leafColumn = computeOrderByLeafColumn(leaf, objectNameSingular);

    if (
      !isDefined(leafColumn) ||
      leafColumn.columnType !== FieldMetadataType.DATE_TIME
    ) {
      return [];
    }

    return [
      {
        expression: `to_char(${quoteColumn(leafColumn.tableAlias, leafColumn.columnName)} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`,
        alias: computeDateTimeCursorValueAlias(leafColumn),
      },
    ];
  });
