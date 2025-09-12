import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useHTMLElementByIdWhenAvailable } from '~/hooks/useHTMLElementByIdWhenAvailable';

export const RecordTableWidthEffect = () => {
  const setRecordTableWidth = useSetRecoilComponentState(
    recordTableWidthComponentState,
  );

  const scrollWrapperInstanceId = useAvailableComponentInstanceIdOrThrow(
    ScrollWrapperComponentInstanceContext,
  );

  const recordTableScrollWrapperHTMLId = `scroll-wrapper-${scrollWrapperInstanceId}`;

  const { element: scrollWrapperElement } = useHTMLElementByIdWhenAvailable(
    recordTableScrollWrapperHTMLId,
  );

  useEffect(() => {
    const tableWidth = scrollWrapperElement?.clientWidth ?? 0;

    if (tableWidth > 0) {
      setRecordTableWidth(tableWidth);
    }

    const tableResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === scrollWrapperElement) {
          const newWidth = scrollWrapperElement.clientWidth;

          setRecordTableWidth(newWidth);
        }
      }
    });

    if (isDefined(scrollWrapperElement)) {
      tableResizeObserver.observe(scrollWrapperElement);
    }

    return () => {
      tableResizeObserver.disconnect();
    };
  }, [setRecordTableWidth, scrollWrapperElement, scrollWrapperInstanceId]);

  return null;
};
