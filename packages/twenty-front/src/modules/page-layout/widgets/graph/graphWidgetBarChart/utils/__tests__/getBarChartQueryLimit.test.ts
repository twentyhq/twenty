import { EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS } from '@/page-layout/widgets/graph/constants/ExtraItemToDetectTooManyGroups';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import {
  type BarChartConfiguration,
  BarChartGroupMode,
} from '~/generated-metadata/graphql';
import { getBarChartQueryLimit } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartQueryLimit';

describe('getBarChartQueryLimit', () => {
  it('should return one-dimensional limit for bar chart without secondary axis', () => {
    const result = getBarChartQueryLimit({
      __typename: 'BarChartConfiguration',
      secondaryAxisGroupByFieldMetadataId: null,
      groupMode: BarChartGroupMode.STACKED,
    } as BarChartConfiguration);

    expect(result).toBe(
      BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS +
        EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS,
    );
  });

  it('should return two-dimensional stacked limit for bar chart with secondary axis and stacked mode', () => {
    const result = getBarChartQueryLimit({
      __typename: 'BarChartConfiguration',
      secondaryAxisGroupByFieldMetadataId: 'some-field-id',
      groupMode: BarChartGroupMode.STACKED,
    } as BarChartConfiguration);

    expect(result).toBe(
      BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS *
        BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_GROUPS_PER_BAR +
        EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS,
    );
  });

  it('should return one-dimensional limit for bar chart with secondary axis and grouped mode', () => {
    const result = getBarChartQueryLimit({
      __typename: 'BarChartConfiguration',
      secondaryAxisGroupByFieldMetadataId: 'some-field-id',
      groupMode: BarChartGroupMode.GROUPED,
    } as BarChartConfiguration);

    expect(result).toBe(
      BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS +
        EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS,
    );
  });
});
