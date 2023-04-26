import * as React from 'react';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import TableHeader from './table-header/TableHeader';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import styled from '@emotion/styled';
import {
  FilterType,
  SelectedSortType,
  SortType,
} from './table-header/interface';

type OwnProps<TData, SortField> = {
  data: Array<TData>;
  columns: Array<ColumnDef<TData, any>>;
  viewName: string;
  viewIcon?: IconProp;
  onSortsUpdate?: (sorts: Array<SelectedSortType<SortField>>) => void;
  availableSorts?: Array<SortType<SortField>>;
  availableFilters?: FilterType[];
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

function Table<TData, SortField extends string>({
  data,
  columns,
  viewName,
  viewIcon,
  onSortsUpdate,
  availableSorts,
  availableFilters,
}: OwnProps<TData, SortField>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <StyledTableWithHeader>
      <TableHeader
        viewName={viewName}
        viewIcon={viewIcon}
        onSortsUpdate={onSortsUpdate}
        availableSorts={availableSorts}
        availableFilters={availableFilters}
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
                    <td key={cell.id}>
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
          {table
            .getFooterGroups()
            .flatMap((group) => group.headers)
            .filter((header) => !!header.column.columnDef.footer).length >
            0 && (
            <tfoot>
              {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot>
          )}
        </StyledTable>
      </StyledTableScrollableContainer>
    </StyledTableWithHeader>
  );
}

export default Table;
