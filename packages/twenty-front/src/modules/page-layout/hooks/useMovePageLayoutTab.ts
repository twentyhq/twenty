import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useMovePageLayoutTab = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  // Deleting a tab only deactivates it in the draft, so an inactive tab must
  // not become the neighbour a move swaps positions with: that would leave the
  // rendered order untouched.
  const swapWithNeighborTab = useCallback(
    (tabId: string, offset: -1 | 1) => {
      store.set(pageLayoutDraftState, (prev) => {
        const sortedActiveTabs = sortTabsByPosition(
          prev.tabs.filter((tab) => tab.isActive),
        );
        const index = sortedActiveTabs.findIndex((tab) => tab.id === tabId);
        const neighborIndex = index + offset;

        if (
          index < 0 ||
          neighborIndex < 0 ||
          neighborIndex >= sortedActiveTabs.length
        ) {
          return prev;
        }

        const neighborTab = sortedActiveTabs[neighborIndex];
        const currentPosition = sortedActiveTabs[index].position;

        return {
          ...prev,
          tabs: prev.tabs.map((tab) => {
            if (tab.id === tabId) {
              return { ...tab, position: neighborTab.position };
            }
            if (tab.id === neighborTab.id) {
              return { ...tab, position: currentPosition };
            }
            return tab;
          }),
        };
      });
    },
    [pageLayoutDraftState, store],
  );

  const moveLeft = useCallback(
    (tabId: string) => swapWithNeighborTab(tabId, -1),
    [swapWithNeighborTab],
  );

  const moveRight = useCallback(
    (tabId: string) => swapWithNeighborTab(tabId, 1),
    [swapWithNeighborTab],
  );

  return { moveLeft, moveRight };
};
