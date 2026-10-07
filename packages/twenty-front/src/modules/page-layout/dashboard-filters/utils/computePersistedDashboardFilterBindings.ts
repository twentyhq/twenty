import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

export const computePersistedDashboardFilterBindings = ({
  widgets,
}: {
  widgets: Pick<PageLayoutWidget, 'id' | 'type' | 'configuration'>[];
}): Record<string, Record<string, DashboardFilterBinding | null>> =>
  Object.fromEntries(
    widgets.flatMap((widget) => {
      if (
        widget.type !== WidgetType.GRAPH ||
        !isWidgetConfigurationOfTypeGraph(widget.configuration)
      ) {
        return [];
      }

      const dashboardFilterBindings = widget.configuration
        .dashboardFilterBindings as
        | Record<string, DashboardFilterBinding | null>
        | null
        | undefined;

      if (!isDefined(dashboardFilterBindings)) {
        return [];
      }

      return [[widget.id, dashboardFilterBindings]];
    }),
  );
