import { GraphType } from '@/command-menu/pages/page-layout/types/GraphType';
import { assertUnreachable } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated/graphql';

export const getConfigurationTypeFromGraphType = (
  graphType: GraphType,
): WidgetConfigurationType => {
  switch (graphType) {
    case GraphType.VERTICAL_BAR:
    case GraphType.HORIZONTAL_BAR:
      return WidgetConfigurationType.BAR_CHART;
    case GraphType.LINE:
      return WidgetConfigurationType.LINE_CHART;
    case GraphType.PIE:
      return WidgetConfigurationType.PIE_CHART;
    case GraphType.AGGREGATE:
      return WidgetConfigurationType.AGGREGATE_CHART;
    case GraphType.GAUGE:
      return WidgetConfigurationType.GAUGE_CHART;
    default:
      assertUnreachable(graphType);
  }
};
