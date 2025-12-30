import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { pageLayoutSelectedCellsComponentState } from '@/page-layout/states/pageLayoutSelectedCellsComponentState';

export const useChangePageLayoutDragSelection = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutSelectedCellsState = useRecoilComponentCallbackState(
    pageLayoutSelectedCellsComponentState,
    pageLayoutId,
  );

  const changePageLayoutDragSelection = useRecoilCallback(
    ({ set }) =>
      (cellId: string, selected: boolean) => {
        set(pageLayoutSelectedCellsState, (prev) => {
          const newSet = new Set(prev);
          if (selected) {
            newSet.add(cellId);
          } else {
            newSet.delete(cellId);
          }
          return newSet;
        });
      },
    [pageLayoutSelectedCellsState],
  );

  return { changePageLayoutDragSelection };
};
