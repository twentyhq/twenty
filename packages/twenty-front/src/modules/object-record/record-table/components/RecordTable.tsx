import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';

import { RecordGroupContextProvider } from '@/object-record/record-group/components/RecordGroupContextProvider';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableContextProvider } from '@/object-record/record-table/components/RecordTableContextProvider';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { RecordTableBody } from '@/object-record/record-table/record-table-body/components/RecordTableBody';
import { RecordTableBodyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyEffect';
import { RecordTableBodyUnselectEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyUnselectEffect';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useRef } from 'react';

const StyledTable = styled.table`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
`;

type RecordTableProps = {
  viewBarId: string;
  recordTableId: string;
  objectNameSingular: string;
  onColumnsChange: (columns: any) => void;
};

export const RecordTable = ({
  viewBarId,
  recordTableId,
  objectNameSingular,
  onColumnsChange,
}: RecordTableProps) => {
  const tableBodyRef = useRef<HTMLTableElement>(null);

  const { toggleClickOutsideListener } = useClickOutsideListener(
    RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
  );

  const { resetTableRowSelection, setRowSelected } = useRecordTable({
    recordTableId,
  });
  if (!isNonEmptyString(objectNameSingular)) {
    return <></>;
  }

  return (
    <RecordTableComponentInstance
      recordTableId={recordTableId}
      onColumnsChange={onColumnsChange}
    >
      <RecordTableContextProvider
        objectNameSingular={objectNameSingular}
        recordTableId={recordTableId}
        viewBarId={viewBarId}
      >
        <RecordGroupContextProvider objectNameSingular={objectNameSingular}>
        <RecordTableBodyEffect />
        <RecordTableBodyUnselectEffect
          tableBodyRef={tableBodyRef}
          recordTableId={recordTableId}
        />
          <RecordTableEmptyHandler recordTableId={recordTableId}>
          <>
            <StyledTable className="entity-table-cell" ref={tableBodyRef}>
              <RecordTableHeader
                objectMetadataNameSingular={objectNameSingular}
              />
              <RecordTableBody />
            </StyledTable>
            <DragSelect
              dragSelectable={tableBodyRef}
              onDragSelectionStart={() => {
                resetTableRowSelection();
                toggleClickOutsideListener(false);
              }}
              onDragSelectionChange={setRowSelected}
              onDragSelectionEnd={() => {
                toggleClickOutsideListener(true);
              }}
            />
          </>
          </RecordTableEmptyHandler>
        </RecordGroupContextProvider>
      </RecordTableContextProvider>
    </RecordTableComponentInstance>
  );
};
