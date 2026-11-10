import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import {
  AggregateOperations,
  AxisNameDisplay,
  BarChartLayout,
  GraphOrderBy,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

describe('buildDefaultBarChartConfiguration', () => {
  it('should build a vertical bar chart configuration from the field selection', () => {
    const configuration = buildDefaultBarChartConfiguration({
      fieldSelection: {
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: AggregateOperations.COUNT,
        groupByFieldMetadataId: 'field-2',
        groupByOrderBy: GraphOrderBy.FIELD_ASC,
      },
      timezone: 'Europe/Paris',
      firstDayOfTheWeek: 1,
    });

    expect(configuration).toEqual({
      __typename: 'BarChartConfiguration',
      configurationType: WidgetConfigurationType.BAR_CHART,
      layout: BarChartLayout.VERTICAL,
      displayDataLabel: true,
      displayLegend: true,
      color: 'auto',
      primaryAxisGroupByFieldMetadataId: 'field-2',
      aggregateFieldMetadataId: 'field-1',
      aggregateOperation: AggregateOperations.COUNT,
      primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
      axisNameDisplay: AxisNameDisplay.NONE,
      timezone: 'Europe/Paris',
      firstDayOfTheWeek: 1,
    });
  });
});
