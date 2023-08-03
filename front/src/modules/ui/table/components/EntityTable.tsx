import { useCallback, useRef } from 'react';
import {
  boxesIntersect,
  useSelectionContainer,
} from '@air/react-drag-to-select';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { SelectedSortType, SortType } from '@/ui/filter-n-sort/types/interface';
import { useListenClickOutside } from '@/ui/utilities/click-outside/hooks/useListenClickOutside';
import { useUpdateViewFieldMutation } from '~/generated/graphql';

import { useLeaveTableFocus } from '../hooks/useLeaveTableFocus';
import { useMapKeyboardToSoftFocus } from '../hooks/useMapKeyboardToSoftFocus';
import { EntityUpdateMutationHookContext } from '../states/EntityUpdateMutationHookContext';
import { isRowSelectedFamilyState } from '../states/isRowSelectedFamilyState';
import { tableRowIdsState } from '../states/tableRowIdsState';
import { viewFieldsFamilyState } from '../states/viewFieldsState';
import { TableHeader } from '../table-header/components/TableHeader';

import { EntityTableBody } from './EntityTableBody';
import { EntityTableHeader } from './EntityTableHeader';

const StyledTable = styled.table`
  border-collapse: collapse;

  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  margin-left: ${({ theme }) => theme.table.horizontalCellMargin};
  margin-right: ${({ theme }) => theme.table.horizontalCellMargin};
  table-layout: fixed;
  width: calc(100% - ${({ theme }) => theme.table.horizontalCellMargin} * 2);

  th {
    border: 1px solid ${({ theme }) => theme.border.color.light};
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
    border: 1px solid ${({ theme }) => theme.border.color.light};
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

const StyledTableContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

const StyledTableWrapper = styled.div`
  flex: 1;
  overflow: auto;
`;

type OwnProps<SortField> = {
  viewName: string;
  viewIcon?: React.ReactNode;
  availableSorts?: Array<SortType<SortField>>;
  onSortsUpdate?: (sorts: Array<SelectedSortType<SortField>>) => void;
  onRowSelectionChange?: (rowSelection: string[]) => void;
  useUpdateEntityMutation: any;
};

export function EntityTable<SortField>({
  viewName,
  viewIcon,
  availableSorts,
  onSortsUpdate,
  useUpdateEntityMutation,
}: OwnProps<SortField>) {
  const tableBodyRef = useRef<HTMLDivElement>(null);
  const entityTableBodyRef = useRef<HTMLTableSectionElement>(null);
  const rowIds = useRecoilValue(tableRowIdsState);

  const setRowSelectedState = useRecoilCallback(
    ({ set }) =>
      (rowId: string, selected: boolean) => {
        set(isRowSelectedFamilyState(rowId), selected);
      },
  );

  const { DragSelection } = useSelectionContainer({
    eventsElement: tableBodyRef.current,
    onSelectionStart: () => {
      Array.from(entityTableBodyRef.current?.children ?? []).forEach(
        (item, index) => {
          setRowSelectedState(rowIds[index], false);
        },
      );
    },
    onSelectionChange: (box) => {
      const scrollAwareBox = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX,
      };
      Array.from(entityTableBodyRef.current?.children ?? []).forEach(
        (item, index) => {
          if (boxesIntersect(scrollAwareBox, item.getBoundingClientRect())) {
            setRowSelectedState(rowIds[index], true);
          } else {
            setRowSelectedState(rowIds[index], false);
          }
        },
      );
    },
  });

  const viewFields = useRecoilValue(viewFieldsFamilyState);
  const setViewFields = useSetRecoilState(viewFieldsFamilyState);

  const [updateViewFieldMutation] = useUpdateViewFieldMutation();

  useMapKeyboardToSoftFocus();

  const leaveTableFocus = useLeaveTableFocus();

  useListenClickOutside({
    refs: [tableBodyRef],
    callback: () => {
      leaveTableFocus();
    },
  });

  const handleColumnResize = useCallback(
    (resizedFieldId: string, width: number) => {
      setViewFields((previousViewFields) =>
        previousViewFields.map((viewField) =>
          viewField.id === resizedFieldId
            ? { ...viewField, columnSize: width }
            : viewField,
        ),
      );
      updateViewFieldMutation({
        variables: {
          data: { sizeInPx: width },
          where: { id: resizedFieldId },
        },
      });
    },
    [setViewFields, updateViewFieldMutation],
  );

  return (
    <EntityUpdateMutationHookContext.Provider value={useUpdateEntityMutation}>
      <StyledTableWithHeader>
        <StyledTableContainer ref={tableBodyRef}>
          <TableHeader
            viewName={viewName}
            viewIcon={viewIcon}
            availableSorts={availableSorts}
            onSortsUpdate={onSortsUpdate}
          />
          <StyledTableWrapper>
            {viewFields.length > 0 && (
              <StyledTable>
                <EntityTableHeader
                  onColumnResize={handleColumnResize}
                  viewFields={viewFields}
                />
                <EntityTableBody tbodyRef={entityTableBodyRef} />
              </StyledTable>
            )}
          </StyledTableWrapper>
          <DragSelection />
        </StyledTableContainer>
      </StyledTableWithHeader>
    </EntityUpdateMutationHookContext.Provider>
  );
}
