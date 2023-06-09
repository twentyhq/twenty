import * as React from 'react';
import styled from '@emotion/styled';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRecoilState, useSetRecoilState } from 'recoil';

import {
  FilterConfigType,
  SelectedFilterType,
} from '@/filters-and-sorts/interfaces/filters/interface';
import {
  SelectedSortType,
  SortType,
} from '@/filters-and-sorts/interfaces/sorts/interface';
import { contextMenuPositionState } from '@/ui/tables/states/contextMenuPositionState';

import { useResetTableRowSelection } from '../../tables/hooks/useResetTableRowSelection';
import { currentRowSelectionState } from '../../tables/states/rowSelectionState';

import { TableHeader } from './table-header/TableHeader';

type OwnProps<
  TData extends { id: string; __typename: 'companies' | 'people' },
  SortField,
> = {
  data: Array<TData>;
  columns: Array<ColumnDef<TData, any>>;
  viewName: string;
  viewIcon?: React.ReactNode;
  availableSorts?: Array<SortType<SortField>>;
  availableFilters?: FilterConfigType<TData>[];
  onSortsUpdate?: (sorts: Array<SelectedSortType<SortField>>) => void;
  onFiltersUpdate?: (filters: Array<SelectedFilterType<TData>>) => void;
  onRowSelectionChange?: (rowSelection: string[]) => void;
};

const StyledTable = styled.table`
  border-radius: 4px;
  border-spacing: 0;
  border-collapse: collapse;
  margin-left: ${(props) => props.theme.table.horizontalCellMargin};
  margin-right: ${(props) => props.theme.table.horizontalCellMargin};
  table-layout: fixed;

  th {
    border-collapse: collapse;
    color: ${(props) => props.theme.text40};
    padding: 0;
    border: 1px solid ${(props) => props.theme.tertiaryBackground};
    text-align: left;

    min-width: ${(props) => props.theme.table.cellMinWidth};
    max-width: ${(props) => props.theme.table.cellMaxWidth};

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      min-width: ${(props) => props.theme.table.checkboxColumnWidth};
      width: ${(props) => props.theme.table.checkboxColumnWidth};

      border-left-color: transparent;
      border-right-color: transparent;
    }
    :last-of-type {
      width: 100%;
      min-width: 0;
    }

    overflow: hidden;
  }

  td {
    border-collapse: collapse;
    color: ${(props) => props.theme.text80};
    padding: 0;
    border: 1px solid ${(props) => props.theme.tertiaryBackground};

    min-width: ${(props) => props.theme.table.cellMinWidth};
    max-width: ${(props) => props.theme.table.cellMaxWidth};

    text-align: left;

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      min-width: ${(props) => props.theme.table.checkboxColumnWidth};
      width: ${(props) => props.theme.table.checkboxColumnWidth};

      border-left-color: transparent;
      border-right-color: transparent;
    }
    :last-of-type {
      width: 100%;
      min-width: 0;
    }

    overflow: hidden;
  }
`;

const StyledTableWithHeader = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
`;

const StyledTableScrollableContainer = styled.div`
  overflow: auto;
  height: 100%;
  flex: 1;
`;

const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.secondaryBackground : 'none'};
`;

export function EntityTable<
  TData extends { id: string; __typename: 'companies' | 'people' },
  SortField,
>({
  data,
  columns,
  viewName,
  viewIcon,
  availableSorts,
  availableFilters,
  onSortsUpdate,
  onFiltersUpdate,
}: OwnProps<TData, SortField>) {
  const [currentRowSelection, setCurrentRowSelection] = useRecoilState(
    currentRowSelectionState,
  );
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);

  const resetTableRowSelection = useResetTableRowSelection();

  React.useEffect(() => {
    resetTableRowSelection();
  }, [resetTableRowSelection]);

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      rowSelection: currentRowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setCurrentRowSelection,
    getRowId: (row) => row.id,
  });

  function handleContextMenu(event: React.MouseEvent, id: string) {
    event.preventDefault();
    setCurrentRowSelection((prev) => ({ ...prev, [id]: true }));

    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
  }

  return (
    <StyledTableWithHeader>
      <TableHeader
        viewName={viewName}
        viewIcon={viewIcon}
        availableSorts={availableSorts}
        availableFilters={availableFilters}
        onSortsUpdate={onSortsUpdate}
        onFiltersUpdate={onFiltersUpdate}
      />
      <StyledTableScrollableContainer>
        <StyledTable>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, headerIndex) => (
                  <th
                    key={header.id}
                    style={{
                      width: header.column.getSize(),
                      minWidth: header.column.getSize(),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
                <th></th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <StyledRow
                key={row.id}
                data-testid={`row-id-${row.index}`}
                selected={!!currentRowSelection[row.id]}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      key={cell.id + row.original.id}
                      onContextMenu={(event) =>
                        handleContextMenu(event, row.original.id)
                      }
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </StyledRow>
            ))}
          </tbody>
        </StyledTable>
      </StyledTableScrollableContainer>
    </StyledTableWithHeader>
  );
}
