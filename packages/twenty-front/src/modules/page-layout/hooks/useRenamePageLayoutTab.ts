import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { useCallback } from 'react';

export const useRenamePageLayoutTab = (pageLayoutId?: string) => {
  const { setPageLayoutDraft } = usePageLayoutDraftState(pageLayoutId);

  const renamePageLayoutTab = useCallback(
    (tabId: string, newTitle: string) => {
      setPageLayoutDraft((prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === tabId ? { ...tab, title: newTitle } : tab,
        ),
      }));
    },
    [setPageLayoutDraft],
  );

  return { renamePageLayoutTab };
};
