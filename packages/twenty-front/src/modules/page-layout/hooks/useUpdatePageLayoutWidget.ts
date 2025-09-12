import { pageLayoutDraftState } from '@/page-layout/states/pageLayoutDraftState';
import { type PageLayoutWidgetWithData } from '@/page-layout/types/pageLayoutTypes';
import { useRecoilCallback } from 'recoil';

export const useUpdatePageLayoutWidget = () => {
  const updatePageLayoutWidget = useRecoilCallback(
    ({ set }) =>
      (widgetId: string, updates: Partial<PageLayoutWidgetWithData>) => {
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

  return { updatePageLayoutWidget };
};
