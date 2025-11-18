import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { tableWidthResizeIsActiveState } from '@/object-record/record-table/states/tableWidthResizeIsActivedState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableWidthEffect = () => {
  const setRecordTableWidth = useSetRecoilComponentState(
    recordTableWidthComponentState,
  );

  const tableWidthResizeIsActive = useRecoilValue(
    tableWidthResizeIsActiveState,
  );

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  useEffect(() => {
    const tableWidth = scrollWrapperHTMLElement?.clientWidth ?? 0;

    if (tableWidthResizeIsActive) {
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
  }, [setRecordTableWidth, scrollWrapperHTMLElement, tableWidthResizeIsActive]);

  return null;
};
