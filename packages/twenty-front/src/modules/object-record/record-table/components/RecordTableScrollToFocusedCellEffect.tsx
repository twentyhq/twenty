import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isRecordTableCellFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableCellFocusActiveComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { getRecordTableCellId } from '@/object-record/record-table/utils/getRecordTableCellId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableScrollToFocusedCellEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const isRecordTableCellFocusActive = useAtomComponentStateValue(
    isRecordTableCellFocusActiveComponentState,
    recordTableId,
  );

  const store = useStore();

  const allRecordIdsCallbackState = useAtomComponentSelectorCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const recordTableFocusPosition = useAtomComponentStateValue(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  useEffect(() => {
    if (!isRecordTableCellFocusActive) {
      return;
    }

    if (!recordTableFocusPosition) {
      return;
    }

    const recordId = store.get(allRecordIdsCallbackState)[
      recordTableFocusPosition.row
    ];

    if (!isDefined(recordId)) {
      return;
    }

    const focusElement = document.getElementById(
      getRecordTableCellId({
        recordTableId,
        columnIndex: recordTableFocusPosition.column,
        recordId,
      }),
    );

    if (!focusElement) {
      return;
    }

    const isSecondColumn = recordTableFocusPosition.column === 1;

    if (isSecondColumn) {
      const checkBoxColumnCell = document.getElementById(
        getRecordTableCellId({ recordTableId, columnIndex: 0, recordId }),
      );
      const firstColumnCell = document.getElementById(
        getRecordTableCellId({ recordTableId, columnIndex: 1, recordId }),
      );

      if (isDefined(checkBoxColumnCell) && isDefined(firstColumnCell)) {
        const checkBoxColumnWidth = checkBoxColumnCell.offsetWidth;
        const firstColumnWidth = firstColumnCell.offsetWidth;
        focusElement.style.scrollMarginLeft = `${checkBoxColumnWidth + firstColumnWidth}px`;
      }
    }

    focusElement.style.scrollMarginTop = `${RECORD_TABLE_ROW_HEIGHT}px`;
    focusElement.style.scrollMarginBottom = `${RECORD_TABLE_ROW_HEIGHT}px`;

    focusElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    return () => {
      if (isDefined(focusElement)) {
        focusElement.style.scrollMarginLeft = '';
        focusElement.style.scrollMarginBottom = '';
      }
    };
  }, [
    recordTableId,
    recordTableFocusPosition,
    isRecordTableCellFocusActive,
    allRecordIdsCallbackState,
    store,
  ]);

  return null;
};
