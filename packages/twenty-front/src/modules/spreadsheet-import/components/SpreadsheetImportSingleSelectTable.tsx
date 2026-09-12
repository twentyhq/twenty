import { SpreadsheetImportTable } from '@/spreadsheet-import/components/SpreadsheetImportTable';
import { getSpreadsheetImportSingleSelectColumn } from '@/spreadsheet-import/components/internal/getSpreadsheetImportSingleSelectColumn';
import { type SpreadsheetImportSingleSelectTableProps } from '@/spreadsheet-import/types/SpreadsheetImportSingleSelectTableProps';
import { styled } from '@linaria/react';
import { type Key, useMemo } from 'react';
import { type DataGridProps } from 'react-data-grid';
import { isDefined } from 'twenty-shared/utils';
import { RadioGroup, type RadioGroupProps } from 'twenty-ui/input';

const StyledRadioGroupContainer = styled.div`
  flex: 1;
  min-height: 0;
`;

// The grid owns keyboard navigation, including rows outside the viewport.
const preventRadioGroupNavigation: RadioGroupProps['onKeyDown'] = (event) => {
  event.preventBaseUIHandler();
};

export const SpreadsheetImportSingleSelectTable = <
  TData,
  TRowKey extends Key = Key,
>({
  className,
  columns,
  headerRowHeight,
  rows,
  rowKeyGetter,
  selectedRowKey,
  onSelectedRowChange,
  selectionLabel,
}: SpreadsheetImportSingleSelectTableProps<TData, TRowKey>) => {
  const selectionColumns = useMemo(
    () => [getSpreadsheetImportSingleSelectColumn(rowKeyGetter), ...columns],
    [columns, rowKeyGetter],
  );

  const selectRow = (rowKey: TRowKey) => {
    if (rowKey !== selectedRowKey) {
      onSelectedRowChange(rowKey);
    }
  };

  const handleCellClick: DataGridProps<TData>['onCellClick'] = (
    { row },
    event,
  ) => {
    if (!event.defaultPrevented) {
      selectRow(rowKeyGetter(row));
    }
  };

  const handleSelectedCellChange: DataGridProps<TData>['onSelectedCellChange'] =
    ({ row }) => {
      if (isDefined(row)) {
        selectRow(rowKeyGetter(row));
      }
    };

  if (!rows.length) return null;

  return (
    <RadioGroup
      render={<StyledRadioGroupContainer />}
      aria-label={selectionLabel}
      value={selectedRowKey}
      onValueChange={selectRow}
      onKeyDownCapture={preventRadioGroupNavigation}
      onKeyDown={preventRadioGroupNavigation}
    >
      <SpreadsheetImportTable
        className={className}
        headerRowHeight={headerRowHeight}
        rows={rows}
        columns={selectionColumns}
        rowKeyGetter={rowKeyGetter}
        onCellClick={handleCellClick}
        onSelectedCellChange={handleSelectedCellChange}
      />
    </RadioGroup>
  );
};
