import { useRecoilCallback } from 'recoil';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutTabsState } from '../states/pageLayoutTabsState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';
import { removeWidgetFromTab } from '../utils/removeWidgetFromTab';
import { removeWidgetLayoutFromTab } from '../utils/removeWidgetLayoutFromTab';

export const usePageLayoutWidgetDelete = () => {
  const handleRemoveWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (widgetId: string) => {
        const pageLayoutWidgets = snapshot
          .getLoadable(pageLayoutWidgetsState)
          .getValue();
        const allTabLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();

        const widgetToRemove = pageLayoutWidgets.find((w) => w.id === widgetId);
        const tabId = widgetToRemove?.pageLayoutTabId;

        const updatedWidgets = pageLayoutWidgets.filter(
          (w) => w.id !== widgetId,
        );
        set(pageLayoutWidgetsState, updatedWidgets);

        if (tabId !== undefined) {
          const updatedLayouts = removeWidgetLayoutFromTab(
            allTabLayouts,
            tabId,
            widgetId,
          );
          set(pageLayoutCurrentLayoutsState, updatedLayouts);

          set(pageLayoutTabsState, (prevTabs) =>
            removeWidgetFromTab(prevTabs, tabId, widgetId),
          );

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
