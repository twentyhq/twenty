import { EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS } from '@/page-layout/widgets/graph/constants/ExtraItemToDetectTooManyGroups.constant';
import { LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMaximumNumberOfDataPoints.constant';
import { LINE_CHART_MAXIMUM_NUMBER_OF_NON_STACKED_SERIES } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMaximumNumberOfNonStackedSeries.constant';
import { LINE_CHART_MAXIMUM_NUMBER_OF_STACKED_SERIES } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMaximumNumberOfStackedSeries.constant';
import { type LineChartConfiguration } from '~/generated-metadata/graphql';
import { getLineChartQueryLimit } from '../getLineChartQueryLimit';

describe('getLineChartQueryLimit', () => {
  it('should return one-dimensional limit for line chart without secondary axis', () => {
    const result = getLineChartQueryLimit({
      __typename: 'LineChartConfiguration',
      secondaryAxisGroupByFieldMetadataId: null,
      isStacked: false,
    } as LineChartConfiguration);

    expect(result).toBe(
      LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS +
        EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS,
    );
  });

  it('should return two-dimensional stacked limit for line chart with secondary axis and stacked mode', () => {
    const result = getLineChartQueryLimit({
      __typename: 'LineChartConfiguration',
      secondaryAxisGroupByFieldMetadataId: 'some-field-id',
      isStacked: true,
    } as LineChartConfiguration);

    expect(result).toBe(
      LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS *
        LINE_CHART_MAXIMUM_NUMBER_OF_STACKED_SERIES +
        EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS,
    );
  });

  it('should return two-dimensional non-stacked limit for line chart with secondary axis and non-stacked mode', () => {
    const result = getLineChartQueryLimit({
      __typename: 'LineChartConfiguration',
      secondaryAxisGroupByFieldMetadataId: 'some-field-id',
      isStacked: false,
    } as LineChartConfiguration);

    expect(result).toBe(
      LINE_CHART_MAXIMUM_NUMBER_OF_DATA_POINTS *
        LINE_CHART_MAXIMUM_NUMBER_OF_NON_STACKED_SERIES +
        EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS,
    );
  });
});
