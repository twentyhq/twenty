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

  const moveLeft = useCallback(
    (tabId: string) => {
      store.set(pageLayoutDraftState, (prev) => {
        const sorted = sortTabsByPosition(prev.tabs);
        const index = sorted.findIndex((t) => t.id === tabId);
        if (index <= 0) {
          return prev;
        }

        const neighborId = sorted[index - 1].id;
        const currentPosition = sorted[index].position;
        const neighborPosition = sorted[index - 1].position;

        return {
          ...prev,
          tabs: prev.tabs.map((t) => {
            if (t.id === tabId) {
              return { ...t, position: neighborPosition };
            }
            if (t.id === neighborId) {
              return { ...t, position: currentPosition };
            }
            return t;
          }),
        };
      });
    },
    [pageLayoutDraftState, store],
  );

  const moveRight = useCallback(
    (tabId: string) => {
      store.set(pageLayoutDraftState, (prev) => {
        const sorted = sortTabsByPosition(prev.tabs);
        const index = sorted.findIndex((t) => t.id === tabId);
        if (index < 0 || index >= sorted.length - 1) {
          return prev;
        }

        const neighborId = sorted[index + 1].id;
        const currentPosition = sorted[index].position;
        const neighborPosition = sorted[index + 1].position;

        return {
          ...prev,
          tabs: prev.tabs.map((t) => {
            if (t.id === tabId) {
              return { ...t, position: neighborPosition };
            }
            if (t.id === neighborId) {
              return { ...t, position: currentPosition };
            }
            return t;
          }),
        };
      });
    },
    [pageLayoutDraftState, store],
  );

  return { moveLeft, moveRight };
};
