import DataGrid, { DataGridProps } from 'react-data-grid';
import styled from '@emotion/styled';

import { useRsi } from '../hooks/useRsi';

const StyledDataGrid = styled(DataGrid)`
  --rdg-background-color: ${({ theme }) => theme.background.primary};
  --rdg-border-color: ${({ theme }) => theme.border.color.medium};
  --rdg-color: ${({ theme }) => theme.font.color.primary};
  --rdg-error-cell-background-color: ${({ theme }) => theme.color.red};
  --rdg-font-size: ${({ theme }) => theme.font.size.sm};
  --rdg-frozen-cell-box-shadow: none;
  --rdg-header-background-color: ${({ theme }) => theme.accent.primary};
  --rdg-info-cell-background-color: ${({ theme }) => theme.color.blue};
  --rdg-row-height: 52px;
  --rdg-row-hover-background-color: ${({ theme }) => theme.accent.primary};
  --rdg-row-selected-background-color: ${({ theme }) => theme.accent.primary};
  --rdg-selection-color: ${({ theme }) => theme.color.blue};
  --rdg-warning-cell-background-color: ${({ theme }) => theme.color.orange};
  --row-selected-hover-background-color: ${({ theme }) => theme.accent.primary};
  block-size: 100%;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};

  .rdg-header-row .rdg-cell {
    color: ${({ theme }) => theme.font.color.primary};
    font-size: ${({ theme }) => theme.font.size.sm};
    font-weight: ${({ theme }) => theme.font.weight.semiBold};
    letter-spacing: wider;
    text-transform: uppercase;
  }
  .rdg-header-row .rdg-cell:first-of-type {
    border-top-left-radius: ${({ theme }) => theme.spacing(2)};
  }
  .rdg-header-row .rdg-cell:last-child {
    border-top-right-radius: ${({ theme }) => theme.spacing(2)};
  }

  /* .rdg-row:last-child .rdg-cell:first-of-type */
  .rdg-row:last-child .rdg-cell:first-of-type {
    border-bottom-left-radius: ${({ theme }) => theme.spacing(2)};
  }

  /* .rdg-row:last-child .rdg-cell:last-child */
  .rdg-row:last-child .rdg-cell:last-child {
    border-bottom-right-radius: ${({ theme }) => theme.spacing(2)};
  }

  /* .rdg[dir='rtl'] */
  .rdg[dir='rtl'] .rdg-row:last-child .rdg-cell:first-of-type {
    border-bottom-left-radius: none;
    border-bottom-right-radius: ${({ theme }) => theme.spacing(2)};
  }
  .rdg[dir='rtl'] .rdg-row:last-child .rdg-cell:last-child {
    border-bottom-left-radius: ${({ theme }) => theme.spacing(2)};
    border-bottom-right-radius: none;
  }

  /* .rdg-cell */
  .rdg-cell {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
    border-inline-end: none;
    border-right: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .rdg-cell[aria-selected='true'] {
    box-shadow: ${({ theme }) => theme.boxShadow.light};
  }
  .rdg-cell:first-of-type {
    border-inline-start: 1px solid ${({ theme }) => theme.border.color.medium};
    box-shadow: none;
  }
  .rdg-cell:last-child {
    border-inline-end: 1px solid ${({ theme }) => theme.border.color.medium};
  }

  /* .rdg-cell-error */
  .rdg-cell-error {
    background-color: ${({ theme }) => theme.color.red};
  }

  /* .rdg-cell-warning */
  .rdg-cell-warning {
    background-color: ${({ theme }) => theme.color.orange};
  }

  /* .rdg-cell-info */
  .rdg-cell-info {
    background-color: ${({ theme }) => theme.color.blue};
  }

  /* .rdg-static */
  .rdg-static {
    cursor: pointer;
  }
  .rdg-static .rdg-header-row {
    display: none;
  }
  .rdg-static .rdg-cell {
    --rdg-selection-color: none;
  }

  /* .rdg-example .rdg-cell */
  .rdg-example .rdg-cell {
    --rdg-selection-color: none;
    border-bottom: none;
  }

  /* .rdg-radio */
  .rdg-radio {
    align-items: center;
    display: flex;
  }

  /* .rdg-checkbox */
  .rdg-checkbox {
    --rdg-selection-color: none;
    align-items: center;
    display: flex;
  }
` as typeof DataGrid;

interface Props<Data> extends DataGridProps<Data> {
  rowHeight?: number;
  hiddenHeader?: boolean;
}

export const Table = <Data,>({ className, ...props }: Props<Data>) => {
  const { rtl } = useRsi();
  return <StyledDataGrid direction={rtl ? 'rtl' : 'ltr'} {...props} />;
};
