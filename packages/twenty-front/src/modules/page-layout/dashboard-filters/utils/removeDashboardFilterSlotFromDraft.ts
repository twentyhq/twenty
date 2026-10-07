import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

const removeSlotBindingFromWidget = (
  widget: PageLayoutWidget,
  slotId: string,
): PageLayoutWidget => {
  if (
    !isWidgetConfigurationOfTypeGraph(widget.configuration) ||
    !isDefined(widget.configuration.dashboardFilterBindings) ||
    !(slotId in widget.configuration.dashboardFilterBindings)
  ) {
    return widget;
  }

  return {
    ...widget,
    configuration: {
      ...widget.configuration,
      dashboardFilterBindings: removePropertiesFromRecord(
        widget.configuration.dashboardFilterBindings,
        [slotId],
      ),
    },
  };
};

export const removeDashboardFilterSlotFromDraft = ({
  draft,
  slotId,
}: {
  draft: DraftPageLayout;
  slotId: string;
}): DraftPageLayout => {
  const dashboardFilters = draft.dashboardFilters as
    | DashboardFilterSlot[]
    | null
    | undefined;

  return {
    ...draft,
    dashboardFilters: isDefined(dashboardFilters)
      ? dashboardFilters.filter((slot) => slot.id !== slotId)
      : dashboardFilters,
    tabs: draft.tabs.map((tab) => ({
      ...tab,
      widgets: tab.widgets.map((widget) =>
        removeSlotBindingFromWidget(widget, slotId),
      ),
    })),
  };
};
