import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useScrollTableToPosition = () => {
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const scrollTableToPosition = useCallback(
    ({
      horizontalScrollInPx,
      verticalScrollInPx,
    }: {
      verticalScrollInPx?: number;
      horizontalScrollInPx?: number;
    }) => {
      const { scrollWrapperElement } = getScrollWrapperElement();

      if (isDefined(verticalScrollInPx)) {
        scrollWrapperElement?.scrollTo({
          top: verticalScrollInPx,
        });
      }

      if (isDefined(horizontalScrollInPx)) {
        scrollWrapperElement?.scrollTo({
          left: horizontalScrollInPx,
        });
      }
    },
    [getScrollWrapperElement],
  );

  return { scrollTableToPosition };
};
