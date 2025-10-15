import { isNonEmptyString } from '@sniptt/guards';
import { useRef } from 'react';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { recordIndexHasRecordsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexHasRecordsComponentSelector';
import { RecordTableBodyEffectsWrapper } from '@/object-record/record-table/components/RecordTableBodyEffectsWrapper';
import { RecordTableContent } from '@/object-record/record-table/components/RecordTableContent';
import { RecordTableEmpty } from '@/object-record/record-table/components/RecordTableEmpty';
import { RecordTableScrollToFocusedCellEffect } from '@/object-record/record-table/components/RecordTableScrollToFocusedCellEffect';
import { RecordTableScrollToFocusedRowEffect } from '@/object-record/record-table/components/RecordTableScrollToFocusedRowEffect';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordTable = () => {
  const { recordTableId, objectNameSingular, objectMetadataItem } =
    useRecordTableContextOrThrow();

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const tableBodyRef = useRef<HTMLDivElement>(null);

  const { toggleClickOutside } = useClickOutsideListener(
    RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
  );

  const isRecordTableInitialLoading = useRecoilComponentValue(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const recordTableHasRecords = useRecoilComponentValue(
    recordIndexHasRecordsComponentSelector,
    recordTableId,
  );

  const hasRecordGroups = useRecoilComponentValue(
    hasRecordGroupsComponentSelector,
    recordTableId,
  );

  const { resetTableRowSelection } = useResetTableRowSelection(recordTableId);

  const recordTableIsEmpty =
    !isRecordTableInitialLoading && !recordTableHasRecords;

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
          hasRecordGroups={hasRecordGroups}
          recordTableId={recordTableId}
        />
      )}
    </>
  );
};
