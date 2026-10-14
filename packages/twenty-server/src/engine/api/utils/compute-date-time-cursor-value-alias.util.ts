import { type OrderByLeafColumn } from 'src/engine/api/utils/compute-order-by-leaf-column.util';
import { buildColumnResultAlias } from 'src/engine/twenty-orm/sql/utils/build-column-result-alias.util';

export const computeDateTimeCursorValueAlias = ({
  tableAlias,
  columnName,
}: Pick<OrderByLeafColumn, 'tableAlias' | 'columnName'>): string =>
  buildColumnResultAlias(tableAlias, `${columnName}_cursor`);
