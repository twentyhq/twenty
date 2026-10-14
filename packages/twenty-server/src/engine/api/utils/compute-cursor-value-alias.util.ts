import { FieldMetadataType } from 'twenty-shared/types';

import { type OrderByLeafColumn } from 'src/engine/api/utils/compute-order-by-leaf-column.util';
import { buildColumnResultAlias } from 'src/engine/twenty-orm/sql/utils/build-column-result-alias.util';

export const computeCursorValueAlias = ({
  tableAlias,
  columnName,
  columnType,
}: OrderByLeafColumn): string =>
  buildColumnResultAlias(
    tableAlias,
    columnType === FieldMetadataType.DATE_TIME
      ? `${columnName}_cursor`
      : columnName,
  );
