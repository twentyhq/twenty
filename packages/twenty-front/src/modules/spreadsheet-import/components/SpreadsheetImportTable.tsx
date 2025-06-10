import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
// @ts-expect-error  // Todo: remove usage of react-data-grid
import DataGrid, { DataGridProps } from 'react-data-grid';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { RGBA } from 'twenty-ui/theme';

const StyledDataGrid = styled(DataGrid)`
  --rdg-background-color: ${({ theme }) => theme.background.primary};
  --rdg-border-color: ${({ theme }) => theme.border.color.medium};
  --rdg-color: ${({ theme }) => theme.font.color.primary};
  --rdg-error-cell-background-color: ${({ theme }) =>
    RGBA(theme.color.red, 0.4)};
  --rdg-font-size: ${({ theme }) => theme.font.size.sm};
  --rdg-frozen-cell-box-shadow: none;
  --rdg-header-background-color: ${({ theme }) => theme.background.primary};
  --rdg-info-cell-background-color: ${({ theme }) => theme.color.blue};
  --rdg-row-hover-background-color: ${({ theme }) =>
    theme.background.secondary};
  --rdg-row-selected-background-color: ${({ theme }) =>
    theme.background.primary};
  --rdg-row-selected-hover-background-color: ${({ theme }) =>
    theme.background.secondary};
  --rdg-selection-color: ${({ theme }) => theme.color.blue};
  --rdg-summary-border-color: ${({ theme }) => theme.border.color.medium};
  --rdg-warning-cell-background-color: ${({ theme }) => theme.color.orange};
  --row-selected-hover-background-color: ${({ theme }) =>
    theme.background.secondary};

  block-size: 100%;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  width: 100%;

  .rdg-header-row .rdg-cell {
    box-shadow: none;
    color: ${({ theme }) => theme.font.color.tertiary};
    font-size: ${({ theme }) => theme.font.size.sm};
    font-weight: ${({ theme }) => theme.font.weight.semiBold};
    letter-spacing: wider;
    text-transform: uppercase;
    ${({ headerRowHeight }) => {
      if (headerRowHeight === 0) {
        return `
          border: none;
        `;
      }
    }};
  }

  .rdg-cell {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
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
    background-color: ${({ theme }) => RGBA(theme.color.red, 0.08)};
  }

  .rdg-cell-warning {
    background-color: ${({ theme }) => RGBA(theme.color.orange, 0.08)};
  }

  .rdg-cell-info {
    background-color: ${({ theme }) => RGBA(theme.color.blue, 0.08)};
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
` as typeof DataGrid;

type SpreadsheetImportTableProps<Data> = DataGridProps<Data> & {
  rowHeight?: number;
  hiddenHeader?: boolean;
};

export const SpreadsheetImportTable = <Data,>({
  className,
  columns,
  components,
  headerRowHeight,
  rowKeyGetter,
  rows,
  onRowClick,
  onRowsChange,
  onSelectedRowsChange,
  selectedRows,
}: SpreadsheetImportTableProps<Data>) => {
  const { rtl } = useSpreadsheetImportInternal();
  const theme = useTheme();
  const themeClassName = theme.name === 'dark' ? 'rdg-dark' : 'rdg-light';

  if (!rows?.length || !columns?.length) return null;

  return (
    <StyledDataGrid
      direction={rtl ? 'rtl' : 'ltr'}
      rowHeight={52}
      {...{
        className: `${className || ''} ${themeClassName}`,
        columns,
        components,
        headerRowHeight,
        rowKeyGetter,
        rows,
        onRowClick,
        onRowsChange,
        onSelectedRowsChange,
        selectedRows,
      }}
    />
  );
};
