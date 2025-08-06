import { isNonEmptyString } from '@sniptt/guards';
import { useRef } from 'react';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableBodyEffectsWrapper } from '@/object-record/record-table/components/RecordTableBodyEffectsWrapper';
import { RecordTableContent } from '@/object-record/record-table/components/RecordTableContent';
import { RecordTableEmpty } from '@/object-record/record-table/components/RecordTableEmpty';
import { RecordTableScrollToFocusedCellEffect } from '@/object-record/record-table/components/RecordTableScrollToFocusedCellEffect';
import { RecordTableScrollToFocusedRowEffect } from '@/object-record/record-table/components/RecordTableScrollToFocusedRowEffect';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordTable = () => {
  const { recordTableId, objectNameSingular, objectMetadataItem } =
    useRecordTableContextOrThrow();

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const tableBodyRef = useRef<HTMLTableElement>(null);

  const { toggleClickOutside } = useClickOutsideListener(
    RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
  );

  const isRecordTableInitialLoading = useRecoilComponentValue(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const allRecordIds = useRecoilComponentValue(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const hasRecordGroups = useRecoilComponentValue(
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
    toggleClickOutside(false);
  };

  const handleDragSelectionEnd = () => {
    toggleClickOutside(true);
  };

  return (
    <>
      {objectPermissions.canReadObjectRecords && (
        <>
          <RecordTableBodyEffectsWrapper
            hasRecordGroups={hasRecordGroups}
            tableBodyRef={tableBodyRef}
          />
          <RecordTableScrollToFocusedCellEffect />
          <RecordTableScrollToFocusedRowEffect />
        </>
      )}
      {recordTableIsEmpty && !hasRecordGroups ? (
        <RecordTableEmpty tableBodyRef={tableBodyRef} />
      ) : (
        <RecordTableContent
          tableBodyRef={tableBodyRef}
          handleDragSelectionStart={handleDragSelectionStart}
          handleDragSelectionEnd={handleDragSelectionEnd}
          setRowSelected={setRowSelected}
          hasRecordGroups={hasRecordGroups}
          recordTableId={recordTableId}
        />
      )}
    </>
  );
};
