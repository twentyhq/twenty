import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableScrollToFocusedCellEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const focusPosition = useRecoilComponentValueV2(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  // Handle cell focus
  useEffect(() => {
    if (!focusPosition) {
      return;
    }

    const focusElement = document.getElementById(
      `record-table-cell-${focusPosition.column}-${focusPosition.row}`,
    );

    if (!focusElement) {
      return;
    }

    const isSecondColumn = focusPosition.column === 1;

    if (isSecondColumn) {
      const checkBoxColumnCell = document.getElementById(
        `record-table-cell-0-0`,
      );
      const firstColumnCell = document.getElementById(`record-table-cell-1-0`);

      if (isDefined(checkBoxColumnCell) && isDefined(firstColumnCell)) {
        const checkBoxColumnWidth = checkBoxColumnCell.offsetWidth;
        const firstColumnWidth = firstColumnCell.offsetWidth;
        focusElement.style.scrollMarginLeft = `${checkBoxColumnWidth + firstColumnWidth}px`;
      }
    }

    focusElement.style.scrollMarginTop = '32px';
    focusElement.style.scrollMarginBottom = '32px';

    focusElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    return () => {
      if (isDefined(focusElement)) {
        focusElement.style.scrollMarginLeft = '';
        focusElement.style.scrollMarginBottom = '';
      }
    };
  }, [focusPosition]);

  return null;
};
