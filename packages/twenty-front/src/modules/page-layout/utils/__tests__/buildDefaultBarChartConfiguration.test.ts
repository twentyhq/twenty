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
        groupByFieldMetadataIdX: 'field-2',
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
      aggregateOperation: AggregateOperations.SUM,
      primaryAxisOrderBy: GraphOrderBy.FIELD_POSITION_ASC,
      axisNameDisplay: AxisNameDisplay.NONE,
      timezone: 'Europe/Paris',
      firstDayOfTheWeek: 1,
    });
  });

  it('should leave the field metadata ids empty without a field selection', () => {
    const configuration = buildDefaultBarChartConfiguration({});

    expect(configuration).toMatchObject({
      primaryAxisGroupByFieldMetadataId: '',
      aggregateFieldMetadataId: '',
    });
  });
});
