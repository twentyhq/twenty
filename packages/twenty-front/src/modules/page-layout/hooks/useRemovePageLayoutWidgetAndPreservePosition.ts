import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { removeWidgetFromTab } from '@/page-layout/utils/removeWidgetFromTab';
import { removeWidgetLayoutFromTab } from '@/page-layout/utils/removeWidgetLayoutFromTab';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRemovePageLayoutWidgetAndPreservePosition = (
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

  const pageLayoutCurrentLayoutsState = useRecoilComponentStateCallbackStateV2(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const pageLayoutDraggedAreaState = useRecoilComponentStateCallbackStateV2(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetIdState = useRecoilComponentStateCallbackStateV2(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const removePageLayoutWidgetAndPreservePosition = useCallback(
    (widgetId: string) => {
      const pageLayoutDraft = store.get(pageLayoutDraftState);
      const allTabLayouts = store.get(pageLayoutCurrentLayoutsState);

      const tabWithWidget = pageLayoutDraft.tabs.find((tab) =>
        tab.widgets.some((w) => w.id === widgetId),
      );
      const tabId = tabWithWidget?.id;

      if (!isDefined(tabId)) {
        return;
      }

      const tabLayouts = allTabLayouts[tabId];
      const widgetLayout = tabLayouts?.desktop?.find(
        (layout) => layout.i === widgetId,
      );

      if (!isDefined(widgetLayout)) {
        return;
      }

      store.set(pageLayoutDraggedAreaState, {
        x: widgetLayout.x,
        y: widgetLayout.y,
        w: widgetLayout.w,
        h: widgetLayout.h,
      });

      const updatedLayouts = removeWidgetLayoutFromTab(
        allTabLayouts,
        tabId,
        widgetId,
      );
      store.set(pageLayoutCurrentLayoutsState, updatedLayouts);

      store.set(pageLayoutDraftState, (prev) => ({
        ...prev,
        tabs: removeWidgetFromTab(prev.tabs, tabId, widgetId),
      }));

      store.set(pageLayoutEditingWidgetIdState, null);
    },
    [
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      pageLayoutDraggedAreaState,
      pageLayoutEditingWidgetIdState,
      store,
    ],
  );

  return { removePageLayoutWidgetAndPreservePosition };
};
