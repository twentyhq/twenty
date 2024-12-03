// @ts-expect-error // Todo: remove usage of react-data-grid
import { Column, FormatterProps, useRowSelection } from 'react-data-grid';

import { ImportedRow } from '@/spreadsheet-import/types';
import { Radio } from 'twenty-ui';

const SELECT_COLUMN_KEY = 'select-row';

type SelectFormatterProps = FormatterProps<unknown>;

const SelectFormatter = (props: SelectFormatterProps) => {
  const [isRowSelected, onRowSelectionChange] = useRowSelection();

  return (
    <Radio
      aria-label="Select"
      checked={isRowSelected}
      onChange={(event) => {
        onRowSelectionChange({
          row: props.row,
          checked: Boolean(event.target.checked),
          isShiftClick: (event.nativeEvent as MouseEvent).shiftKey,
        });
      }}
    />
  );
};

export const SelectColumn: Column<any, any> = {
  key: SELECT_COLUMN_KEY,
  name: '',
  width: 35,
  minWidth: 35,
  maxWidth: 35,
  resizable: false,
  sortable: false,
  frozen: true,
  cellClass: 'rdg-radio',
  formatter: SelectFormatter,
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
