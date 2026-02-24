import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';

export const useUpdatePageLayoutTab = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useRecoilComponentStateCallbackStateV2(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const updatePageLayoutTab = useCallback(
    (tabId: string, updates: Partial<PageLayoutTab>) => {
      store.set(pageLayoutDraftState, (prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === tabId ? { ...tab, ...updates } : tab,
        ),
      }));
    },
    [pageLayoutDraftState, store],
  );

  return { updatePageLayoutTab };
};
