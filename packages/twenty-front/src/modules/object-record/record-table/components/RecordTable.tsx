import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useRef } from 'react';

import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableStickyBottomEffect } from '@/object-record/record-table/components/RecordTableStickyBottomEffect';
import { RecordTableStickyEffect } from '@/object-record/record-table/components/RecordTableStickyEffect';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyState } from '@/object-record/record-table/empty-state/components/RecordTableEmptyState';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { RecordTableBodyUnselectEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyUnselectEffect';
import { RecordTableNoRecordGroupBody } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBody';
import { RecordTableNoRecordGroupBodyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBodyEffect';
import { RecordTableRecordGroupBodyEffects } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupBodyEffects';
import { RecordTableRecordGroupsBody } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupsBody';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

const StyledTable = styled.table`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;

  .footer-sticky tr:nth-last-of-type(2) td {
    border-bottom-color: ${({ theme }) => theme.background.transparent};
  }
`;

interface TableContentProps {
  tableBodyRef: React.RefObject<HTMLTableElement>;
  handleDragSelectionStart: () => void;
  handleDragSelectionEnd: () => void;
  setRowSelected: (rowId: string, selected: boolean) => void;
  hasRecordGroups: boolean;
}

const TableContent = ({
  tableBodyRef,
  handleDragSelectionStart,
  handleDragSelectionEnd,
  setRowSelected,
  hasRecordGroups,
}: TableContentProps) => (
  <>
    <StyledTable ref={tableBodyRef}>
      <RecordTableHeader />
      {hasRecordGroups ? (
        <RecordTableRecordGroupsBody />
      ) : (
        <RecordTableNoRecordGroupBody />
      )}
      <RecordTableStickyEffect />
      <RecordTableStickyBottomEffect />
    </StyledTable>
    <DragSelect
      dragSelectable={tableBodyRef}
      onDragSelectionStart={handleDragSelectionStart}
      onDragSelectionChange={setRowSelected}
      onDragSelectionEnd={handleDragSelectionEnd}
    />
  </>
);

interface EmptyTableProps {
  tableBodyRef: React.RefObject<HTMLTableElement>;
  hasRecordGroups: boolean;
}

const EmptyTable = ({ tableBodyRef, hasRecordGroups }: EmptyTableProps) => (
  <>
    <StyledTable ref={tableBodyRef}>
      <RecordTableHeader />
    </StyledTable>
    {hasRecordGroups ? (
      <RecordTableRecordGroupsBody />
    ) : (
      <RecordTableEmptyState />
    )}
  </>
);

interface RecordTableBodyEffectsProps {
  hasRecordGroups: boolean;
  tableBodyRef: React.RefObject<HTMLTableElement>;
}

const RecordTableBodyEffects = ({
  hasRecordGroups,
  tableBodyRef,
}: RecordTableBodyEffectsProps) => (
  <>
    {hasRecordGroups ? (
      <RecordTableRecordGroupBodyEffects />
    ) : (
      <RecordTableNoRecordGroupBodyEffect />
    )}
    <RecordTableBodyUnselectEffect tableBodyRef={tableBodyRef} />
  </>
);

export const RecordTable = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const tableBodyRef = useRef<HTMLTableElement>(null);

  const { toggleClickOutsideListener } = useClickOutsideListener(
    RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
  );

  const isRecordTableInitialLoading = useRecoilComponentValueV2(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const allRecordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const hasRecordGroups = useRecoilComponentValueV2(
    hasRecordGroupsComponentSelector,
    recordTableId,
  );

  const { resetTableRowSelection, setRowSelected } = useRecordTable({
    recordTableId,
  });

  const recordTableIsEmpty =
    !isRecordTableInitialLoading && allRecordIds.length === 0;

  if (!isNonEmptyString(objectNameSingular)) {
    return <></>;
  }

  const handleDragSelectionStart = () => {
    resetTableRowSelection();
    toggleClickOutsideListener(false);
  };

  const handleDragSelectionEnd = () => {
    toggleClickOutsideListener(true);
  };

  return (
    <>
      <RecordTableBodyEffects
        hasRecordGroups={hasRecordGroups}
        tableBodyRef={tableBodyRef}
      />

      {recordTableIsEmpty ? (
        <EmptyTable
          tableBodyRef={tableBodyRef}
          hasRecordGroups={hasRecordGroups}
        />
      ) : (
        <TableContent
          tableBodyRef={tableBodyRef}
          handleDragSelectionStart={handleDragSelectionStart}
          handleDragSelectionEnd={handleDragSelectionEnd}
          setRowSelected={setRowSelected}
          hasRecordGroups={hasRecordGroups}
        />
      )}
    </>
  );
};
