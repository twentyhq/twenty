import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useSetAsPinnedTab = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const setAsPinnedTab = useCallback(
    (tabId: string) => {
      store.set(pageLayoutDraftState, (prev) => {
        const minPosition = Math.min(...prev.tabs.map((t) => t.position));

        return {
          ...prev,
          tabs: prev.tabs.map((t) =>
            t.id === tabId ? { ...t, position: minPosition - 1 } : t,
          ),
        };
      });
    },
    [pageLayoutDraftState, store],
  );

  return { setAsPinnedTab };
};
