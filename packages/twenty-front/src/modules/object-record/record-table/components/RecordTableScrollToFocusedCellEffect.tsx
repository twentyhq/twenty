import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isRecordTableCellFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableCellFocusActiveComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { getRecordTableCellId } from '@/object-record/record-table/utils/getRecordTableCellId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableScrollToFocusedCellEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const isRecordTableCellFocusActive = useAtomComponentStateValue(
    isRecordTableCellFocusActiveComponentState,
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

    const focusElement = document.getElementById(
      getRecordTableCellId(
        recordTableId,
        recordTableFocusPosition.column,
        recordTableFocusPosition.row,
      ),
    );

    if (!focusElement) {
      return;
    }

    const isSecondColumn = recordTableFocusPosition.column === 1;

    if (isSecondColumn) {
      const checkBoxColumnCell = document.getElementById(
        getRecordTableCellId(recordTableId, 0, 0),
      );
      const firstColumnCell = document.getElementById(
        getRecordTableCellId(recordTableId, 1, 0),
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
  }, [recordTableId, recordTableFocusPosition, isRecordTableCellFocusActive]);

  return null;
};
