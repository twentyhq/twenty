import { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback } from 'recoil';

import { RecordTableBodyEffect } from '@/object-record/record-table/components/RecordTableBodyEffect';
import { RecordTableHeader } from '@/object-record/record-table/components/RecordTableHeader';
import { RecordTableInternalEffect } from '@/object-record/record-table/components/RecordTableInternalEffect';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { mapColumnDefinitionsToViewFields } from '@/views/utils/mapColumnDefinitionToViewField';

import { EntityUpdateMutationContext } from '../contexts/EntityUpdateMutationHookContext';

import { RecordTableBody } from './RecordTableBody';

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
  position: relative;
`;

type RecordTableProps = {
  recordTableId: string;
  viewBarId: string;
  updateRecordMutation: (params: any) => void;
  createRecord: () => void;
};

export const RecordTable = ({
  updateRecordMutation,
  createRecord,
  recordTableId,
  viewBarId,
}: RecordTableProps) => {
  const tableBodyRef = useRef<HTMLDivElement>(null);

  const { resetTableRowSelection, setRowSelectedState } = useRecordTable({
    recordTableScopeId: recordTableId,
  });
  const { persistViewFields } = useViewFields(viewBarId);

  return (
    <RecordTableScope
      recordTableScopeId={recordTableId}
      onColumnsChange={useRecoilCallback(() => (columns) => {
        persistViewFields(mapColumnDefinitionsToViewFields(columns));
      })}
    >
      <ScrollWrapper>
        <EntityUpdateMutationContext.Provider value={updateRecordMutation}>
          <StyledTableWithHeader>
            <StyledTableContainer>
              <div ref={tableBodyRef}>
                <StyledTable className="entity-table-cell">
                  <RecordTableHeader createRecord={createRecord} />
                  <RecordTableBodyEffect />
                  <RecordTableBody />
                </StyledTable>
                <DragSelect
                  dragSelectable={tableBodyRef}
                  onDragSelectionStart={resetTableRowSelection}
                  onDragSelectionChange={setRowSelectedState}
                />
              </div>
              <RecordTableInternalEffect tableBodyRef={tableBodyRef} />
            </StyledTableContainer>
          </StyledTableWithHeader>
        </EntityUpdateMutationContext.Provider>
      </ScrollWrapper>
    </RecordTableScope>
  );
};
