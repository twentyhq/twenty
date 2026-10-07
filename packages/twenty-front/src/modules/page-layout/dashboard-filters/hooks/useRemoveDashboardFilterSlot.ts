import { removeDashboardFilterSlotFromDraft } from '@/page-layout/dashboard-filters/utils/removeDashboardFilterSlotFromDraft';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRemoveDashboardFilterSlot = (pageLayoutId: string) => {
  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const removeDashboardFilterSlot = useCallback(
    (slotId: string) => {
      store.set(pageLayoutDraftState, (previousDraft) =>
        removeDashboardFilterSlotFromDraft({ draft: previousDraft, slotId }),
      );
    },
    [pageLayoutDraftState, store],
  );

  return { removeDashboardFilterSlot };
};
