import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import {
  AggregateOperations,
  BarChartLayout,
  GraphOrderBy,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

type GetChartSettingsStoryConfigurationOptions = {
  chartType: 'bar' | 'aggregate';
  groupFieldMetadataId: string;
  aggregateFieldMetadataId: string;
};

export const getChartSettingsStoryConfiguration = ({
  chartType,
  groupFieldMetadataId,
  aggregateFieldMetadataId,
}: GetChartSettingsStoryConfigurationOptions): ChartConfiguration => {
  if (chartType === 'aggregate') {
    return {
      __typename: 'AggregateChartConfiguration',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateFieldMetadataId: groupFieldMetadataId,
      aggregateOperation: AggregateOperations.COUNT,
    };
  }

  return {
    __typename: 'BarChartConfiguration',
    configurationType: WidgetConfigurationType.BAR_CHART,
    layout: BarChartLayout.VERTICAL,
    aggregateFieldMetadataId,
    aggregateOperation: AggregateOperations.SUM,
    primaryAxisGroupByFieldMetadataId: groupFieldMetadataId,
    primaryAxisOrderBy: GraphOrderBy.FIELD_POSITION_ASC,
    color: 'auto',
  };
};
