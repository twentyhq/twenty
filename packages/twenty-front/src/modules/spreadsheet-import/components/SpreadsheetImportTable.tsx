import { styled } from '@linaria/react';
import { type Key, useContext } from 'react';
import { type SpreadsheetImportTableProps } from '@/spreadsheet-import/types/SpreadsheetImportTableProps';
import { DataGrid } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDataGridContainer = styled.div<{ headerRowHeight?: number }>`
  --rdg-background-color: ${themeCssVariables.background.primary};
  --rdg-border-color: ${themeCssVariables.border.color.medium};
  --rdg-color: ${themeCssVariables.font.color.primary};
  --rdg-error-cell-background-color: ${themeCssVariables.color.transparent
    .red5};
  --rdg-font-size: ${themeCssVariables.font.size.sm};
  --rdg-frozen-cell-box-shadow: none;
  --rdg-header-background-color: ${themeCssVariables.background.primary};
  --rdg-info-cell-background-color: ${themeCssVariables.color.blue};
  --rdg-row-hover-background-color: ${themeCssVariables.background.secondary};
  --rdg-row-selected-background-color: ${themeCssVariables.background.primary};
  --rdg-row-selected-hover-background-color: ${themeCssVariables.background
    .secondary};
  --rdg-selection-color: ${themeCssVariables.color.blue};
  --rdg-summary-border-color: ${themeCssVariables.border.color.medium};
  --rdg-warning-cell-background-color: ${themeCssVariables.color.orange};
  --row-selected-hover-background-color: ${themeCssVariables.background
    .secondary};
  flex: 1;
  min-height: 0;

  > * {
    border: none;
    block-size: 100%;
    width: 100%;
  }

  .rdg-header-row .rdg-cell {
    box-shadow: none;
    color: ${themeCssVariables.font.color.tertiary};
    background-color: ${themeCssVariables.background.secondary};
    font-size: ${themeCssVariables.font.size.sm};
    font-weight: ${themeCssVariables.font.weight.semiBold};
    letter-spacing: wider;
    border-bottom: ${({ headerRowHeight }) =>
      headerRowHeight === 0
        ? 'none'
        : `1px solid ${themeCssVariables.border.color.medium}`};
  }

  .rdg-cell {
    border-bottom: 1px solid ${themeCssVariables.border.color.medium};
    border-inline-end: none;
    border-right: none;
    box-shadow: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rdg-row:last-child > .rdg-cell {
    border-bottom: none;
  }

  .rdg-cell[aria-selected='true'] {
    outline: none;
  }

  .rdg-cell-error {
    background-color: ${themeCssVariables.color.yellow3};
  }

  .rdg-cell-warning {
    background-color: ${themeCssVariables.color.transparent.orange2};
  }

  .rdg-cell-info {
    background-color: ${themeCssVariables.color.transparent.blue2};
  }

  .rdg-static {
    cursor: pointer;
  }

  .rdg-static .rdg-header-row {
    display: none;
  }

  .rdg-static .rdg-cell {
    --rdg-selection-color: none;
  }

  .rdg-example .rdg-cell {
    --rdg-selection-color: none;
    border-bottom: none;
  }

  .rdg-radio {
    align-items: center;
    display: flex;
  }

  .rdg-checkbox {
    align-items: center;
    display: flex;
    line-height: none;
  }
`;

export const SpreadsheetImportTable = <TData, TRowKey extends Key = Key>({
  className,
  columns,
  headerRowHeight,
  rows,
  rowKeyGetter,
  renderers,
  onRowsChange,
  onCellClick,
  onSelectedCellChange,
  selectedRows,
  onSelectedRowsChange,
}: SpreadsheetImportTableProps<TData, TRowKey>) => {
  const { colorScheme } = useContext(ThemeContext);
  const { rtl } = useSpreadsheetImportInternal();
  const themeClassName = colorScheme === 'dark' ? 'rdg-dark' : 'rdg-light';

  if (!rows.length || !columns.length) return null;

  return (
    <StyledDataGridContainer headerRowHeight={headerRowHeight ?? undefined}>
      <DataGrid
        direction={rtl ? 'rtl' : 'ltr'}
        rowHeight={40}
        className={`${className || ''} ${themeClassName}`}
        headerRowHeight={headerRowHeight}
        columns={columns}
        rows={rows}
        rowKeyGetter={rowKeyGetter}
        renderers={renderers}
        onRowsChange={onRowsChange}
        onCellClick={onCellClick}
        onSelectedCellChange={onSelectedCellChange}
        selectedRows={selectedRows}
        onSelectedRowsChange={onSelectedRowsChange}
      />
    </StyledDataGridContainer>
  );
};
