import { useRecoilCallback } from 'recoil';
import { type Widget } from '../mocks/mockWidgets';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutTabsState } from '../states/pageLayoutTabsState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';

export const usePageLayoutWidgetUpdate = () => {
  const handleUpdateWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (widgetId: string, updates: Partial<Widget>) => {
        const pageLayoutWidgets = snapshot
          .getLoadable(pageLayoutWidgetsState)
          .getValue();

        const updatedWidgets = pageLayoutWidgets.map((widget) =>
          widget.id === widgetId ? { ...widget, ...updates } : widget,
        );
        set(pageLayoutWidgetsState, updatedWidgets);

        const widgetToUpdate = pageLayoutWidgets.find((w) => w.id === widgetId);
        const tabId = widgetToUpdate?.pageLayoutTabId;

        set(pageLayoutTabsState, (prevTabs) => {
          return prevTabs.map((tab) => {
            if (tab.id === tabId) {
              return {
                ...tab,
                widgets: tab.widgets.map((widget) =>
                  widget.id === widgetId ? { ...widget, ...updates } : widget,
                ),
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
                widgets: tab.widgets.map((widget) =>
                  widget.id === widgetId ? { ...widget, ...updates } : widget,
                ),
              };
            }
            return tab;
          }),
        }));
      },
    [],
  );

  return { handleUpdateWidget };
};
