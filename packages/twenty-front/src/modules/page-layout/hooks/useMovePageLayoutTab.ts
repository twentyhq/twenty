import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useMovePageLayoutTab = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const moveLeft = useRecoilCallback(
    ({ set }) =>
      (tabId: string) => {
        set(pageLayoutDraftState, (prev) => {
          const sorted = sortTabsByPosition(prev.tabs);
          const index = sorted.findIndex((t) => t.id === tabId);
          if (index <= 0) return prev;

          const items = sorted.filter((t) => t.id !== tabId);
          const destinationIndex = index - 1;
          const sourceIndex = index;

          const newPosition = calculateNewPosition({
            destinationIndex,
            sourceIndex,
            items,
          });

          return {
            ...prev,
            tabs: prev.tabs.map((t) =>
              t.id === tabId ? { ...t, position: newPosition } : t,
            ),
          };
        });
      },
    [pageLayoutDraftState],
  );

  const moveRight = useRecoilCallback(
    ({ set }) =>
      (tabId: string) => {
        set(pageLayoutDraftState, (prev) => {
          const sorted = sortTabsByPosition(prev.tabs);
          const index = sorted.findIndex((t) => t.id === tabId);
          if (index < 0 || index >= sorted.length - 1) return prev;

          const items = sorted.filter((t) => t.id !== tabId);
          const destinationIndex = index + 1;
          const sourceIndex = index;

          const newPosition = calculateNewPosition({
            destinationIndex,
            sourceIndex,
            items,
          });

          return {
            ...prev,
            tabs: prev.tabs.map((t) =>
              t.id === tabId ? { ...t, position: newPosition } : t,
            ),
          };
        });
      },
    [pageLayoutDraftState],
  );

  return { moveLeft, moveRight };
};
