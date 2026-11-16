import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { GraphType } from '@/side-panel/pages/page-layout/types/GraphType';
import { convertBarOrLineChartConfigToPieChart } from '@/side-panel/pages/page-layout/utils/convertBarOrLineChartConfigToPieChart';
import { assertUnreachable } from 'twenty-shared/utils';
import {
  BarChartLayout,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

// Non-bar types keep the bar fields, exactly as switching the type of a default bar chart does.
export const buildDefaultChartConfiguration = ({
  graphType,
  fieldSelection,
  timezone,
  firstDayOfTheWeek,
}: {
  graphType: GraphType;
  fieldSelection?: GraphWidgetFieldSelection;
  timezone?: string;
  firstDayOfTheWeek?: number;
}): PageLayoutWidget['configuration'] => {
  const barChartConfiguration = buildDefaultBarChartConfiguration({
    fieldSelection,
    timezone,
    firstDayOfTheWeek,
  });

  switch (graphType) {
    case GraphType.VERTICAL_BAR:
      return barChartConfiguration;
    case GraphType.HORIZONTAL_BAR:
      return { ...barChartConfiguration, layout: BarChartLayout.HORIZONTAL };
    case GraphType.LINE:
      return {
        ...barChartConfiguration,
        __typename: 'LineChartConfiguration',
        configurationType: WidgetConfigurationType.LINE_CHART,
      };
    case GraphType.PIE:
      return {
        ...barChartConfiguration,
        ...convertBarOrLineChartConfigToPieChart(barChartConfiguration),
        groupByFieldMetadataId:
          barChartConfiguration.primaryAxisGroupByFieldMetadataId,
        __typename: 'PieChartConfiguration',
        configurationType: WidgetConfigurationType.PIE_CHART,
      };
    case GraphType.AGGREGATE:
      return {
        ...barChartConfiguration,
        __typename: 'AggregateChartConfiguration',
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      };
    default:
      return assertUnreachable(graphType);
  }
};
