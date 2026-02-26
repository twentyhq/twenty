import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { focusedRecordTableRowIndexComponentState } from '@/object-record/record-table/states/focusedRecordTableRowIndexComponentState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableScrollToFocusedRowEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const focusedRecordTableRowIndex = useAtomComponentStateValue(
    focusedRecordTableRowIndexComponentState,
    recordTableId,
  );

  const isRecordTableRowFocusActive = useAtomComponentStateValue(
    isRecordTableRowFocusActiveComponentState,
    recordTableId,
  );

  const allRecordIds = useAtomComponentSelectorValue(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  useEffect(() => {
    if (
      !isRecordTableRowFocusActive ||
      !isDefined(focusedRecordTableRowIndex) ||
      !allRecordIds?.length
    ) {
      return;
    }

    const recordId = allRecordIds[focusedRecordTableRowIndex];

    if (!recordId) {
      return;
    }

    const focusElement = document.getElementById(
      `record-table-cell-0-${focusedRecordTableRowIndex}`,
    );

    if (!focusElement) {
      return;
    }

    focusElement.style.scrollMarginBottom = `${RECORD_TABLE_ROW_HEIGHT}px`;
    focusElement.style.scrollMarginTop = `${RECORD_TABLE_ROW_HEIGHT}px`;

    focusElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    return () => {
      if (isDefined(focusElement)) {
        focusElement.style.scrollMarginBottom = '';
      }
    };
  }, [focusedRecordTableRowIndex, isRecordTableRowFocusActive, allRecordIds]);

  return null;
};
