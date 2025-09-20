import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { focusedRecordTableRowIndexComponentState } from '@/object-record/record-table/states/focusedRecordTableRowIndexComponentState';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableScrollToFocusedRowEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const focusedRowIndex = useRecoilComponentValue(
    focusedRecordTableRowIndexComponentState,
    recordTableId,
  );

  const isRowFocusActive = useRecoilComponentValue(
    isRecordTableRowFocusActiveComponentState,
    recordTableId,
  );

  const allRecordIds = useRecoilComponentValue(
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

    focusElement.style.scrollMarginBottom = `${RECORD_TABLE_ROW_HEIGHT}px`;
    focusElement.style.scrollMarginTop = `${RECORD_TABLE_ROW_HEIGHT}px`;

    focusElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    return () => {
      if (isDefined(focusElement)) {
        focusElement.style.scrollMarginBottom = '';
      }
    };
  }, [focusedRowIndex, isRowFocusActive, allRecordIds]);

  return null;
};
