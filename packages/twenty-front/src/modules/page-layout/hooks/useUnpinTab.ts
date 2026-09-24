import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useCallback } from 'react';

export const useUnpinTab = (pageLayoutIdFromProps?: string) => {
  const setPageLayoutDraft = useSetAtomComponentState(
    pageLayoutDraftComponentState,
    pageLayoutIdFromProps,
  );

  const unpinTab = useCallback(() => {
    setPageLayoutDraft((prev) => ({
      ...prev,
      isFirstTabPinned: false,
    }));
  }, [setPageLayoutDraft]);

  return { unpinTab };
};
