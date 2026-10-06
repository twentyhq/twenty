import { getWidgetDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/getWidgetDashboardFilterBindings';
import { mapChartWidgetsInDraft } from '@/page-layout/dashboard-filters/utils/mapChartWidgetsInDraft';
import { setChartWidgetDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/setChartWidgetDashboardFilterBindings';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type DashboardFilterBinding } from 'twenty-shared/types';

export const setWidgetDashboardFilterBindingInDraft = ({
  draft,
  widgetId,
  slotId,
  binding,
}: {
  draft: DraftPageLayout;
  widgetId: string;
  slotId: string;
  binding: DashboardFilterBinding | null;
}): DraftPageLayout =>
  mapChartWidgetsInDraft(draft, (widget) =>
    widget.id === widgetId
      ? setChartWidgetDashboardFilterBindings(widget, {
          ...getWidgetDashboardFilterBindings(widget),
          [slotId]: binding,
        })
      : widget,
  );
