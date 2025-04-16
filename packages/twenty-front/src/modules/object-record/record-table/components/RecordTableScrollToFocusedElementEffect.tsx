import { focusPositionComponentState } from '@/object-record/record-table/states/focusPositionComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableScrollToFocusedElementEffect = () => {
  const focusPosition = useRecoilComponentValueV2(focusPositionComponentState);

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

    const firstColumnCell = document.getElementById(`record-table-cell-0-0`);
    const secondColumnCell = document.getElementById(`record-table-cell-1-0`);

    if (isDefined(firstColumnCell) && isDefined(secondColumnCell)) {
      const firstColumnWidth = firstColumnCell.offsetWidth;
      const secondColumnWidth = secondColumnCell.offsetWidth;
      focusElement.style.scrollMarginLeft = `${firstColumnWidth + secondColumnWidth}px`;
    }

    focusElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [focusPosition]);

  return null;
};
