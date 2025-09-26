import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilCallback } from 'recoil';

export const useUpdateCurrentWidgetConfig = (pageLayoutIdFromProps: string) => {
  const pageLayoutDraftCallbackState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutIdFromProps,
  );

  const currentlyEditingWidgetId = useRecoilComponentValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutIdFromProps,
  );

  const updateCurrentWidgetConfig = useRecoilCallback(
    ({ set }) =>
      (configToUpdate: Record<string, unknown>) => {
        set(pageLayoutDraftCallbackState, (prev) => ({
          ...prev,
          tabs: prev.tabs.map((tab) => ({
            ...tab,
            widgets: tab.widgets.map((widget) =>
              widget.id === currentlyEditingWidgetId
                ? {
                    ...widget,
                    configuration: {
                      ...widget.configuration,
                      ...configToUpdate,
                    },
                  }
                : widget,
            ),
          })),
        }));
      },
    [pageLayoutDraftCallbackState, currentlyEditingWidgetId],
  );

  return { updateCurrentWidgetConfig };
};
