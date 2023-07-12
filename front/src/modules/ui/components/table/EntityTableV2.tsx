import * as React from 'react';
import styled from '@emotion/styled';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRecoilState } from 'recoil';

import {
  SelectedSortType,
  SortType,
} from '@/filters-and-sorts/interfaces/sorts/interface';
import { TableColumn } from '@/people/table/components/peopleColumns';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { useLeaveTableFocus } from '@/ui/tables/hooks/useLeaveTableFocus';
import { RowContext } from '@/ui/tables/states/RowContext';

import { currentRowSelectionState } from '../../tables/states/rowSelectionState';

import { TableHeader } from './table-header/TableHeader';
import { EntityTableBody } from './EntityTableBody';
import { EntityTableHeader } from './EntityTableHeader';
import { EntityTableRow } from './EntityTableRowV2';

const StyledTable = styled.table`
  border-collapse: collapse;

  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  margin-left: ${({ theme }) => theme.table.horizontalCellMargin};
  margin-right: ${({ theme }) => theme.table.horizontalCellMargin};
  table-layout: fixed;
  width: calc(100% - ${({ theme }) => theme.table.horizontalCellMargin} * 2);

  th {
    border: 1px solid ${({ theme }) => theme.background.tertiary};
    border-collapse: collapse;
    color: ${({ theme }) => theme.font.color.tertiary};
    padding: 0;
    text-align: left;

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-left-color: transparent;
      border-right-color: transparent;
    }
    :last-of-type {
      min-width: 0;
      width: 100%;
    }
  }

  td {
    border: 1px solid ${({ theme }) => theme.background.tertiary};
    border-collapse: collapse;
    color: ${({ theme }) => theme.font.color.primary};
    padding: 0;

    text-align: left;

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-left-color: transparent;
      border-right-color: transparent;
    }
    :last-of-type {
      min-width: 0;
      width: 100%;
    }
  }
`;

const StyledTableWithHeader = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
`;

type OwnProps<SortField> = {
  columns: Array<TableColumn>;
  viewName: string;
  viewIcon?: React.ReactNode;
  availableSorts?: Array<SortType<SortField>>;
  onSortsUpdate?: (sorts: Array<SelectedSortType<SortField>>) => void;
  onRowSelectionChange?: (rowSelection: string[]) => void;
};

export function EntityTable<SortField>({
  columns,
  viewName,
  viewIcon,
  availableSorts,
  onSortsUpdate,
}: OwnProps<SortField>) {
  console.log('EntityTable');
  const tableBodyRef = React.useRef<HTMLDivElement>(null);

  const leaveTableFocus = useLeaveTableFocus();

  useListenClickOutsideArrayOfRef([tableBodyRef], () => {
    leaveTableFocus();
  });

  return (
    <StyledTableWithHeader>
      <TableHeader
        viewName={viewName}
        viewIcon={viewIcon}
        availableSorts={availableSorts}
        onSortsUpdate={onSortsUpdate}
      />
      <div ref={tableBodyRef}>
        <StyledTable>
          <EntityTableHeader columns={columns} />
          <EntityTableBody columns={columns} />
        </StyledTable>
      </div>
    </StyledTableWithHeader>
  );
}
