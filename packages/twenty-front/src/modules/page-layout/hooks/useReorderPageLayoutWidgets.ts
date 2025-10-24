import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { type DropResult } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useReorderPageLayoutWidgets = (
  tabId: string,
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const reorderWidgets = useRecoilCallback(
    ({ set }) =>
      (result: DropResult) => {
        if (!result.destination) return;

        set(pageLayoutDraftState, (prev) => {
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
    [tabId, pageLayoutDraftState],
  );

  return { reorderWidgets };
};
