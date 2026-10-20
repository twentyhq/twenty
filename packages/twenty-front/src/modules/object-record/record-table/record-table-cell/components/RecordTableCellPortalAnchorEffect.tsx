import { useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordTableCellPortalAnchorEffectProps = {
  tableCellId: string;
  onAnchorElementMounted: (element: HTMLElement) => void;
};

// The cell can mount in the same commit as the portal, after the portal's render
export const RecordTableCellPortalAnchorEffect = ({
  tableCellId,
  onAnchorElementMounted,
}: RecordTableCellPortalAnchorEffectProps) => {
  useLayoutEffect(() => {
    const element = document.getElementById(tableCellId);

    if (isDefined(element)) {
      onAnchorElementMounted(element);
    }
  }, [tableCellId, onAnchorElementMounted]);

  return null;
};
