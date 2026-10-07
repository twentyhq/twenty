import { type DashboardFilterSlotWidgetCounts } from '@/page-layout/dashboard-filters/types/DashboardFilterSlotWidgetCounts';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

export const countDashboardFilterSlotWidgets = ({
  slotId,
  widgets,
  bindingsByWidgetId,
}: {
  slotId: string;
  widgets: Pick<PageLayoutWidget, 'id' | 'type'>[];
  bindingsByWidgetId: Record<
    string,
    Record<string, DashboardFilterBinding | null>
  >;
}): DashboardFilterSlotWidgetCounts => {
  const graphWidgets = widgets.filter(
    (widget) => widget.type === WidgetType.GRAPH,
  );

  return {
    graphWidgetCount: graphWidgets.length,
    boundWidgetCount: graphWidgets.filter((widget) =>
      isDefined(bindingsByWidgetId[widget.id]?.[slotId]),
    ).length,
  };
};
