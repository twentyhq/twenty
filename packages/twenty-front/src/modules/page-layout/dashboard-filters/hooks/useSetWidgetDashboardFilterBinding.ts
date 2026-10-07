import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useSetWidgetDashboardFilterBinding = (pageLayoutId: string) => {
  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  // Bindings live inside the chart configuration, so the rest of it is carried over untouched.
  const setWidgetDashboardFilterBinding = useCallback(
    ({
      widgetId,
      slotId,
      binding,
    }: {
      widgetId: string;
      slotId: string;
      binding: DashboardFilterBinding | null;
    }) => {
      const widget = store
        .get(pageLayoutDraftState)
        .tabs.flatMap((tab) => tab.widgets)
        .find((widget) => widget.id === widgetId);

      if (
        !isDefined(widget) ||
        !isWidgetConfigurationOfTypeGraph(widget.configuration)
      ) {
        return;
      }

      updatePageLayoutWidget(widgetId, {
        configuration: {
          ...widget.configuration,
          dashboardFilterBindings: {
            ...(widget.configuration.dashboardFilterBindings ?? {}),
            [slotId]: binding,
          },
        },
      });
    },
    [pageLayoutDraftState, store, updatePageLayoutWidget],
  );

  return { setWidgetDashboardFilterBinding };
};
