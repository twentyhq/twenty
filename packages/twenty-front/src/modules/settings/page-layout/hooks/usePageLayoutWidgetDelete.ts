import { useRecoilCallback } from 'recoil';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutTabsState } from '../states/pageLayoutTabsState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';

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

        if (tabId !== undefined && allTabLayouts[tabId] !== undefined) {
          const currentTabLayouts = allTabLayouts[tabId];
          const updatedLayouts = {
            desktop: (currentTabLayouts.desktop || []).filter(
              (layout) => layout.i !== widgetId,
            ),
            mobile: (currentTabLayouts.mobile || []).filter(
              (layout) => layout.i !== widgetId,
            ),
          };
          set(pageLayoutCurrentLayoutsState, {
            ...allTabLayouts,
            [tabId]: updatedLayouts,
          });
        }

        set(pageLayoutTabsState, (prevTabs) => {
          return prevTabs.map((tab) => {
            if (tab.id === tabId) {
              return {
                ...tab,
                widgets: tab.widgets.filter((w) => w.id !== widgetId),
              };
            }
            return tab;
          });
        });

        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          tabs: prev.tabs.map((tab) => {
            if (tab.id === tabId) {
              return {
                ...tab,
                widgets: tab.widgets.filter((w) => w.id !== widgetId),
              };
            }
            return tab;
          }),
        }));
      },
    [],
  );

  return { handleRemoveWidget };
};
