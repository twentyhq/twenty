import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { pageLayoutSelectedCellsComponentState } from '@/page-layout/states/pageLayoutSelectedCellsComponentState';

export const useChangePageLayoutDragSelection = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutSelectedCellsState = useRecoilComponentStateCallbackStateV2(
    pageLayoutSelectedCellsComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const changePageLayoutDragSelection = useCallback(
    (cellId: string, selected: boolean) => {
      store.set(pageLayoutSelectedCellsState, (prev) => {
        const newSet = new Set(prev);
        if (selected) {
          newSet.add(cellId);
        } else {
          newSet.delete(cellId);
        }
        return newSet;
      });
    },
    [pageLayoutSelectedCellsState, store],
  );

  return { changePageLayoutDragSelection };
};
