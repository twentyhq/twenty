import styled from '@emotion/styled';
import { isNonEmptyString, isNull } from '@sniptt/guards';

import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
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
import { RecordTableFooter } from '@/object-record/record-table/record-table-footer/components/RecordTableFooter';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { recordTablePendingRecordIdComponentState } from '@/object-record/record-table/states/recordTablePendingRecordIdComponentState';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRef } from 'react';

const StyledTable = styled.table`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
`;

export const RecordTable = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const tableBodyRef = useRef<HTMLTableElement>(null);

  const isAggregateQueryEnabled = useIsFeatureEnabled(
    'IS_AGGREGATE_QUERY_ENABLED',
  );

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

  const pendingRecordId = useRecoilComponentValueV2(
    recordTablePendingRecordIdComponentState,
    recordTableId,
  );

  const hasRecordGroups = useRecoilComponentValueV2(
    hasRecordGroupsComponentSelector,
    recordTableId,
  );

  const recordTableIsEmpty =
    !isRecordTableInitialLoading &&
    allRecordIds.length === 0 &&
    isNull(pendingRecordId);

  const { resetTableRowSelection, setRowSelected } = useRecordTable({
    recordTableId,
  });

  if (!isNonEmptyString(objectNameSingular)) {
    return <></>;
  }

  return (
    <>
      {!hasRecordGroups ? (
        <RecordTableNoRecordGroupBodyEffect />
      ) : (
        <RecordTableRecordGroupBodyEffects />
      )}
      <RecordTableBodyUnselectEffect tableBodyRef={tableBodyRef} />
      {recordTableIsEmpty ? (
        <RecordTableEmptyState />
      ) : (
        <>
          <StyledTable className="entity-table-cell" ref={tableBodyRef}>
            <RecordTableHeader />
            {!hasRecordGroups ? (
              <RecordTableNoRecordGroupBody />
            ) : (
              <RecordTableRecordGroupsBody />
            )}
            <RecordTableStickyEffect />
            {isAggregateQueryEnabled && <RecordTableFooter />}
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
      )}
    </>
  );
};
