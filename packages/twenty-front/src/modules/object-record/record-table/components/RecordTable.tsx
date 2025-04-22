import { isNonEmptyString } from '@sniptt/guards';
import { useRef } from 'react';

import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableBodyEffectsWrapper } from '@/object-record/record-table/components/RecordTableBodyEffectsWrapper';
import { RecordTableContent } from '@/object-record/record-table/components/RecordTableContent';
import { RecordTableEmpty } from '@/object-record/record-table/components/RecordTableEmpty';
import { RecordTableScrollToFocusedElementEffect } from '@/object-record/record-table/components/RecordTableScrollToFocusedElementEffect';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isRecordTableFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableFocusActiveComponentState';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTable = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const tableBodyRef = useRef<HTMLTableElement>(null);

  const { toggleClickOutside } = useClickOutsideListener(
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

  const isRecordTableFocusActive = useRecoilComponentValueV2(
    isRecordTableFocusActiveComponentState,
    recordTableId,
  );

  if (!isNonEmptyString(objectNameSingular)) {
    return <></>;
  }

  const handleDragSelectionStart = () => {
    resetTableRowSelection();
    toggleClickOutside(false);
  };

  const handleDragSelectionEnd = () => {
    toggleClickOutside(true);
  };

  return (
    <>
      <RecordTableBodyEffectsWrapper
        hasRecordGroups={hasRecordGroups}
        tableBodyRef={tableBodyRef}
      />

      {isRecordTableFocusActive && <RecordTableScrollToFocusedElementEffect />}

      {recordTableIsEmpty && !hasRecordGroups ? (
        <RecordTableEmpty
          tableBodyRef={tableBodyRef}
          hasRecordGroups={hasRecordGroups}
        />
      ) : (
        <RecordTableContent
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
