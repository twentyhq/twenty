import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { removeWidgetFromTab } from '@/page-layout/utils/removeWidgetFromTab';
import { removeWidgetLayoutFromTab } from '@/page-layout/utils/removeWidgetLayoutFromTab';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useRemovePageLayoutWidgetAndPreservePosition = (
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

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const pageLayoutDraggedAreaState = useRecoilComponentCallbackState(
    pageLayoutDraggedAreaComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetIdState = useRecoilComponentCallbackState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const removePageLayoutWidgetAndPreservePosition = useRecoilCallback(
    ({ snapshot, set }) =>
      (widgetId: string) => {
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();
        const allTabLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();

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

        set(pageLayoutDraggedAreaState, {
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
        set(pageLayoutCurrentLayoutsState, updatedLayouts);

        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          tabs: removeWidgetFromTab(prev.tabs, tabId, widgetId),
        }));

        set(pageLayoutEditingWidgetIdState, null);
      },
    [
      pageLayoutCurrentLayoutsState,
      pageLayoutDraftState,
      pageLayoutDraggedAreaState,
      pageLayoutEditingWidgetIdState,
    ],
  );

  return { removePageLayoutWidgetAndPreservePosition };
};
