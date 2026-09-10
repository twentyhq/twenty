// prettier-ignore
import { type Column, type RenderCellProps } from 'react-data-grid';

import { t } from '@lingui/core/macro';
import { type ImportedRow } from '@/spreadsheet-import/types';
import { Radio } from 'twenty-ui/input';

const SELECT_COLUMN_KEY = 'select-row';

type SelectFormatterProps = RenderCellProps<ImportedRow>;

const SelectFormatter = (props: SelectFormatterProps) => {
  return (
    <Radio
      aria-label={t`Select`}
      value={props.rowIdx}
      tabIndex={props.tabIndex}
    />
  );
};

export const SelectColumn: Column<ImportedRow> = {
  key: SELECT_COLUMN_KEY,
  name: '',
  width: 35,
  minWidth: 35,
  maxWidth: 35,
  resizable: false,
  sortable: false,
  frozen: true,
  cellClass: 'rdg-radio',
  renderCell: SelectFormatter,
};

export const generateSelectionColumns = (data: ImportedRow[]) => {
  const longestRowLength = data.reduce(
    (acc, curr) => (acc > curr.length ? acc : curr.length),
    0,
  );
  return [
    SelectColumn,
    ...Array.from(Array(longestRowLength), (_, index) => ({
      key: index.toString(),
      name: '',
    })),
  ];
};
