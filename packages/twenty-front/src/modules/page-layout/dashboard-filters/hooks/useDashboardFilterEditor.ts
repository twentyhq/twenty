import { dashboardFilterSlotsComponentSelector } from '@/page-layout/dashboard-filters/states/dashboardFilterSlotsComponentSelector';
import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { getDashboardFilterBindingsByWidgetIdFromWidgets } from '@/page-layout/dashboard-filters/utils/getDashboardFilterBindingsByWidgetIdFromWidgets';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type ChartWidget } from '@/side-panel/pages/page-layout/types/ChartWidget';
import { isChartWidget } from '@/side-panel/pages/page-layout/utils/isChartWidget';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { isString } from '@sniptt/guards';
import { useMemo } from 'react';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type DashboardFilterEditor = {
  pageLayoutDraft: DraftPageLayout;
  isUsingBuiltInFilters: boolean;
  slots: DashboardFilterSlot[];
  bindingsByWidgetId: DashboardFilterBindingsByWidgetId;
  chartWidgets: ChartWidget[];
};

// The editor reads the draft directly: it must list slots no chart binds yet, which the bar's selector drops on purpose.
export const useDashboardFilterEditor = (
  pageLayoutId: string,
): DashboardFilterEditor => {
  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  // In edit mode the selector resolves the built-ins against the draft, which is what the editor converts when it goes custom.
  const { slotDefinitions, bindingsByWidgetId: selectorBindingsByWidgetId } =
    useAtomComponentSelectorValue(
      dashboardFilterSlotsComponentSelector,
      pageLayoutId,
    );

  const { t } = useLingui();

  const chartWidgets = useMemo(
    () =>
      pageLayoutDraft.tabs.flatMap((tab) => tab.widgets).filter(isChartWidget),
    [pageLayoutDraft.tabs],
  );

  const isUsingBuiltInFilters = !isDefined(pageLayoutDraft.dashboardFilters);

  const slots = useMemo(
    () =>
      isUsingBuiltInFilters
        ? slotDefinitions.map(({ label, ...slot }) => ({
            ...slot,
            label: isString(label) ? label : t(label),
          }))
        : (pageLayoutDraft.dashboardFilters ?? []),
    [
      isUsingBuiltInFilters,
      slotDefinitions,
      pageLayoutDraft.dashboardFilters,
      t,
    ],
  );

  const bindingsByWidgetId = useMemo(
    () =>
      isUsingBuiltInFilters
        ? selectorBindingsByWidgetId
        : getDashboardFilterBindingsByWidgetIdFromWidgets(chartWidgets),
    [isUsingBuiltInFilters, selectorBindingsByWidgetId, chartWidgets],
  );

  return {
    pageLayoutDraft,
    isUsingBuiltInFilters,
    slots,
    bindingsByWidgetId,
    chartWidgets,
  };
};
