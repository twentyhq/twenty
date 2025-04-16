import { focusPositionComponentState } from '@/object-record/record-table/states/focusPositionComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useEffect } from 'react';

export const RecordTableScrollToFocusedElementEffect = () => {
  const focusPosition = useRecoilComponentValueV2(focusPositionComponentState);

  useEffect(() => {
    if (!focusPosition) {
      return;
    }

    const focusElement = document.getElementById(
      `record-table-cell-${focusPosition.column}-${focusPosition.row}`,
    );
    focusElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [focusPosition]);

  return null;
};
