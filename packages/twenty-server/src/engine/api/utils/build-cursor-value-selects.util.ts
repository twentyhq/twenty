import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeCursorValueAlias } from 'src/engine/api/utils/compute-cursor-value-alias.util';
import { computeOrderByLeafColumn } from 'src/engine/api/utils/compute-order-by-leaf-column.util';
import {
  checkIfLeafCanCarryCursorValue,
  type OrderByLeaf,
} from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { quoteColumn } from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';

type CursorValueSelect = {
  expression: string;
  alias: string;
};

export const buildCursorValueSelects = ({
  orderByLeaves,
  objectNameSingular,
  columnsToSelect,
}: {
  orderByLeaves: OrderByLeaf<Pick<OrmFlatFieldMetadata, 'type'>>[];
  objectNameSingular: string;
  columnsToSelect: Record<string, boolean>;
}): CursorValueSelect[] =>
  orderByLeaves.filter(checkIfLeafCanCarryCursorValue).flatMap((leaf) => {
    const leafColumn = computeOrderByLeafColumn(leaf, objectNameSingular);

    if (!isDefined(leafColumn)) {
      return [];
    }

    const isDateTimeField =
      leafColumn.columnType === FieldMetadataType.DATE_TIME;

    if (
      !isDateTimeField &&
      leafColumn.tableAlias === objectNameSingular &&
      columnsToSelect[leafColumn.columnName]
    ) {
      return [];
    }

    const columnReference = quoteColumn(
      leafColumn.tableAlias,
      leafColumn.columnName,
    );

    return [
      {
        expression: isDateTimeField
          ? `to_char(${columnReference} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`
          : columnReference,
        alias: computeCursorValueAlias(leafColumn),
      },
    ];
  });
