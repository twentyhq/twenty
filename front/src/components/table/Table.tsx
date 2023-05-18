import * as React from 'react';
import styled from '@emotion/styled';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import TableHeader from './table-header/TableHeader';
import {
  FilterConfigType,
  SelectedFilterType,
} from '../../interfaces/filters/interface';
import { SortType, SelectedSortType } from '../../interfaces/sorts/interface';

declare module 'react' {
  function forwardRef<T, P = object>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null,
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

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
  min-width: 1000px;
  width: calc(100% - ${(props) => props.theme.spacing(4)});
  border-radius: 4px;
  border-spacing: 0;
  border-collapse: collapse;
  margin-left: ${(props) => props.theme.spacing(2)};
  margin-right: ${(props) => props.theme.spacing(2)};

  th {
    border-collapse: collapse;
    color: ${(props) => props.theme.text40};
    padding: 0;
    border: 1px solid ${(props) => props.theme.tertiaryBackground};
    text-align: left;
    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-left-color: transparent;
    }
  }

  td {
    border-collapse: collapse;
    color: ${(props) => props.theme.text80};
    padding: 0;
    border: 1px solid ${(props) => props.theme.tertiaryBackground};
    text-align: left;
    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-left-color: transparent;
    }
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

const Table = <
  TData extends { id: string; __typename: 'companies' | 'people' },
  SortField,
>(
  {
    data,
    columns,
    viewName,
    viewIcon,
    availableSorts,
    availableFilters,
    onSortsUpdate,
    onFiltersUpdate,
    onRowSelectionChange,
  }: OwnProps<TData, SortField>,
  ref: React.ForwardedRef<{ resetRowSelection: () => void } | undefined>,
) => {
  const [internalRowSelection, setInternalRowSelection] = React.useState({});

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      rowSelection: internalRowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setInternalRowSelection,
    getRowId: (row) => row.id,
  });

  const selectedRows = table.getSelectedRowModel().rows;

  React.useEffect(() => {
    const selectedRowIds = selectedRows.map((row) => row.original.id);
    onRowSelectionChange && onRowSelectionChange(selectedRowIds);
  }, [onRowSelectionChange, selectedRows]);

  React.useImperativeHandle(ref, () => {
    return {
      resetRowSelection: () => {
        table.resetRowSelection();
      },
    };
  });

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
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr key={row.id} data-testid={`row-id-${row.index}`}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id + row.original.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </StyledTableScrollableContainer>
    </StyledTableWithHeader>
  );
};

export default React.forwardRef(Table);
