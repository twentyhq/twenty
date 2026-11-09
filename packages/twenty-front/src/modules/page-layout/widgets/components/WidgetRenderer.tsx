import { useDashboardFilters } from '@/page-layout/hooks/useDashboardFilters';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDashboardFilterDataWidgetConfiguration } from '@/page-layout/utils/isDashboardFilterDataWidgetConfiguration';
import { WidgetDashboardFilterProvider } from '@/page-layout/widgets/components/WidgetDashboardFilterProvider';
import { WidgetRendererCard } from '@/page-layout/widgets/components/WidgetRendererCard';
import { isDefined } from 'twenty-shared/utils';

type WidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const WidgetRenderer = ({ widget }: WidgetRendererProps) => {
  const dashboardFilters = useDashboardFilters();

  if (
    !isDefined(dashboardFilters) ||
    !isDashboardFilterDataWidgetConfiguration(widget.configuration)
  ) {
    return <WidgetRendererCard widget={widget} />;
  }

  return (
    <WidgetDashboardFilterProvider
      widget={widget}
      dashboardFilters={dashboardFilters}
    >
      <WidgetRendererCard widget={widget} />
    </WidgetDashboardFilterProvider>
  );
};
