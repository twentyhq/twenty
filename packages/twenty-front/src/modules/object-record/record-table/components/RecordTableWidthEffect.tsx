import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { panelResizeIsSettledState } from '@/ui/layout/resizable-panel/states/panelResizeIsSettledState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableWidthEffect = () => {
  const setRecordTableWidth = useSetAtomComponentState(
    recordTableWidthComponentState,
  );

  const panelResizeIsSettled = useAtomStateValue(panelResizeIsSettledState);

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  useEffect(() => {
    const tableWidth = scrollWrapperHTMLElement?.clientWidth ?? 0;

    if (panelResizeIsSettled) {
      if (tableWidth > 0) {
        setRecordTableWidth(tableWidth);
      }

      const tableResizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === scrollWrapperHTMLElement) {
            const newWidth = scrollWrapperHTMLElement.clientWidth;
            setRecordTableWidth(newWidth);
          }
        }
      });

      if (isDefined(scrollWrapperHTMLElement)) {
        tableResizeObserver.observe(scrollWrapperHTMLElement);
      }

      return () => {
        tableResizeObserver.disconnect();
      };
    }
  }, [setRecordTableWidth, scrollWrapperHTMLElement, panelResizeIsSettled]);

  return null;
};
