import { useReorderPageLayoutTabs } from '@/page-layout/hooks/useReorderPageLayoutTabs';
import { type DropResult, type ResponderProvided } from '@hello-pangea/dnd';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useReorderRecordPageLayoutTabs = (
  pageLayoutIdFromProps?: string,
) => {
  const { reorderTabs } = useReorderPageLayoutTabs(pageLayoutIdFromProps);

  const reorderRecordPageTabs = useCallback(
    (
      result: DropResult,
      provided: ResponderProvided,
      hasPinnedTab: boolean,
    ): boolean => {
      if (!hasPinnedTab) {
        return reorderTabs(result);
      }

      const { source, destination } = result;

      if (!isDefined(destination)) {
        return reorderTabs(result);
      }

      const adjustedResult: DropResult = {
        ...result,
        source: {
          ...source,
          index: source.index + 1,
        },
        destination: {
          ...destination,
          index: destination.index + 1,
        },
      };

      return reorderTabs(adjustedResult);
    },
    [reorderTabs],
  );

  return { reorderRecordPageTabs };
};
