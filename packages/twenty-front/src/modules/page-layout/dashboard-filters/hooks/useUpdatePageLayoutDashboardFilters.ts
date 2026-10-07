import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { isFunction } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type DashboardFilterSlot } from 'twenty-shared/types';

type DashboardFiltersUpdate =
  | DashboardFilterSlot[]
  | ((previousSlots: DashboardFilterSlot[] | null) => DashboardFilterSlot[]);

export const useUpdatePageLayoutDashboardFilters = (pageLayoutId: string) => {
  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const updatePageLayoutDashboardFilters = useCallback(
    (update: DashboardFiltersUpdate) => {
      store.set(pageLayoutDraftState, (previousDraft) => ({
        ...previousDraft,
        dashboardFilters: isFunction(update)
          ? update(
              (previousDraft.dashboardFilters as
                | DashboardFilterSlot[]
                | null
                | undefined) ?? null,
            )
          : update,
      }));
    },
    [pageLayoutDraftState, store],
  );

  const updatePageLayoutDashboardFilterSlot = useCallback(
    (slotId: string, updates: Partial<Omit<DashboardFilterSlot, 'id'>>) => {
      updatePageLayoutDashboardFilters((previousSlots) =>
        (previousSlots ?? []).map((slot) =>
          slot.id === slotId ? { ...slot, ...updates } : slot,
        ),
      );
    },
    [updatePageLayoutDashboardFilters],
  );

  return {
    updatePageLayoutDashboardFilters,
    updatePageLayoutDashboardFilterSlot,
  };
};
