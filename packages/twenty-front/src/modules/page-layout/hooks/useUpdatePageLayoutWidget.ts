import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type Widget } from '@/page-layout/widgets/types/Widget';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useUpdatePageLayoutWidget = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const updatePageLayoutWidget = useRecoilCallback(
    ({ set }) =>
      (widgetId: string, updates: Partial<Widget>) => {
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
