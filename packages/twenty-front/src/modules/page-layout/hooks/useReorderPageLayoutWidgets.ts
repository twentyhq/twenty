import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { type DropResult } from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useReorderPageLayoutWidgets = (
  tabId: string,
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useRecoilComponentStateCallbackStateV2(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const reorderWidgets = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      store.set(pageLayoutDraftState, (prev) => {
        const tab = prev.tabs.find((t) => t.id === tabId);
        if (!isDefined(tab)) return prev;

        const newWidgets = Array.from(tab.widgets ?? []);
        const [removed] = newWidgets.splice(result.source.index, 1);
        newWidgets.splice(result.destination!.index, 0, removed);

        return {
          ...prev,
          tabs: prev.tabs.map((t) =>
            t.id === tabId ? { ...t, widgets: newWidgets } : t,
          ),
        };
      });
    },
    [tabId, pageLayoutDraftState, store],
  );

  return { reorderWidgets };
};
