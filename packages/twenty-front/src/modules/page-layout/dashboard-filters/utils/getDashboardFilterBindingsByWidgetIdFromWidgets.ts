import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { getWidgetDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/getWidgetDashboardFilterBindings';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetType } from '~/generated-metadata/graphql';

// Unlike the selector feeding the bar, this keeps slots no chart binds yet: the editor must still show them.
export const getDashboardFilterBindingsByWidgetIdFromWidgets = (
  widgets: PageLayoutWidget[],
): DashboardFilterBindingsByWidgetId =>
  Object.fromEntries(
    widgets
      .filter((widget) => widget.type === WidgetType.GRAPH)
      .map((widget) => [widget.id, getWidgetDashboardFilterBindings(widget)]),
  );
