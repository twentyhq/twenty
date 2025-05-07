import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { focusedRecordTableRowIndexComponentState } from '@/object-record/record-table/states/focusedRecordTableRowIndexComponentState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableScrollToFocusedRowEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const focusedRowIndex = useRecoilComponentValueV2(
    focusedRecordTableRowIndexComponentState,
    recordTableId,
  );

  const isRowFocusActive = useRecoilComponentValueV2(
    isRecordTableRowFocusActiveComponentState,
    recordTableId,
  );

  const allRecordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  useEffect(() => {
    if (
      !isRowFocusActive ||
      !isDefined(focusedRowIndex) ||
      !allRecordIds?.length
    ) {
      return;
    }

    const recordId = allRecordIds[focusedRowIndex];

    if (!recordId) {
      return;
    }

    const focusElement = document.getElementById(
      `record-table-cell-0-${focusedRowIndex}`,
    );

    if (!focusElement) {
      return;
    }

    focusElement.style.scrollMarginBottom = '32px';
    focusElement.style.scrollMarginTop = '32px';

    focusElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    return () => {
      if (isDefined(focusElement)) {
        focusElement.style.scrollMarginBottom = '';
      }
    };
  }, [focusedRowIndex, isRowFocusActive, allRecordIds]);

  return null;
};
