import { useRecoilCallback } from 'recoil';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { removeWidgetFromTab } from '../utils/removeWidgetFromTab';
import { removeWidgetLayoutFromTab } from '../utils/removeWidgetLayoutFromTab';

export const usePageLayoutWidgetDelete = () => {
  const handleRemoveWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (widgetId: string) => {
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();
        const allTabLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();

        // Find which tab contains the widget
        const tabWithWidget = pageLayoutDraft.tabs.find((tab) =>
          tab.widgets.some((w) => w.id === widgetId),
        );
        const tabId = tabWithWidget?.id;

        if (tabId !== undefined) {
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
        }
      },
    [],
  );

  return { handleRemoveWidget };
};
