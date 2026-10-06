import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { type DashboardFilterBindingsBySlotId } from 'twenty-shared/types';

// The JSON scalar is typed any by codegen; the server validates the shape on save.
export const getWidgetDashboardFilterBindings = (
  widget: PageLayoutWidget,
): DashboardFilterBindingsBySlotId =>
  isWidgetConfigurationOfTypeGraph(widget.configuration)
    ? ((widget.configuration.dashboardFilterBindings as
        | DashboardFilterBindingsBySlotId
        | null
        | undefined) ?? {})
    : {};
