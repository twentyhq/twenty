import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { GraphType } from '@/command-menu/pages/page-layout/types/GraphType';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { t } from '@lingui/core/macro';
import { BarChartLayout } from '~/generated/graphql';

export const getCurrentGraphTypeFromConfig = (
  configuration: ChartConfiguration,
): GraphType => {
  if (isWidgetConfigurationOfType(configuration, 'BarChartConfiguration')) {
    return configuration.layout === BarChartLayout.HORIZONTAL
      ? GraphType.HORIZONTAL_BAR
      : GraphType.VERTICAL_BAR;
  }

  if (isWidgetConfigurationOfType(configuration, 'LineChartConfiguration')) {
    return GraphType.LINE;
  }

  if (isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')) {
    return GraphType.PIE;
  }

  if (
    isWidgetConfigurationOfType(configuration, 'AggregateChartConfiguration')
  ) {
    return GraphType.AGGREGATE;
  }

  if (isWidgetConfigurationOfType(configuration, 'GaugeChartConfiguration')) {
    return GraphType.GAUGE;
  }

  throw new Error(t`Unknown chart configuration type`);
};
