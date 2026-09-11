import { t } from '@lingui/core/macro';
import { type Key } from 'react';
import { type Column } from 'react-data-grid';
import { Radio } from 'twenty-ui/input';

export const getSpreadsheetImportSingleSelectColumn = <
  TData,
  TRowKey extends Key,
>(
  rowKeyGetter: (row: TData) => TRowKey,
): Column<TData> => ({
  key: 'select-row',
  name: '',
  width: 35,
  minWidth: 35,
  maxWidth: 35,
  resizable: false,
  sortable: false,
  frozen: true,
  cellClass: 'rdg-radio',
  renderCell: ({ row, tabIndex }) => (
    <Radio
      aria-label={t`Select`}
      value={rowKeyGetter(row)}
      tabIndex={tabIndex}
    />
  ),
});
