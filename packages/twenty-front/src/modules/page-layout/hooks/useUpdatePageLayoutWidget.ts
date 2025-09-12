import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type PageLayoutWidgetWithData } from '@/page-layout/types/pageLayoutTypes';
import { getPageLayoutIdInstanceIdFromPageLayoutId } from '@/page-layout/utils/getPageLayoutIdInstanceIdFromPageLayoutId';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useUpdatePageLayoutWidget = (pageLayoutId: string) => {
  const pageLayoutInstanceId =
    getPageLayoutIdInstanceIdFromPageLayoutId(pageLayoutId);

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutInstanceId,
  );

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
    [pageLayoutDraftState],
  );

  return { updatePageLayoutWidget };
};
