import { useRecoilCallback } from 'recoil';
import { type PageLayoutWidget } from '../states/savedPageLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';

export const usePageLayoutWidgetUpdate = () => {
  const handleUpdateWidget = useRecoilCallback(
    ({ set }) =>
      (widgetId: string, updates: Partial<PageLayoutWidget>) => {
        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          tabs: prev.tabs.map((tab) => ({
            ...tab,
            widgets: tab.widgets.map((widget) =>
              widget.id === widgetId ? { ...widget, ...updates } : widget,
            ),
          })),
        }));
      },
    [],
  );

  return { handleUpdateWidget };
};
