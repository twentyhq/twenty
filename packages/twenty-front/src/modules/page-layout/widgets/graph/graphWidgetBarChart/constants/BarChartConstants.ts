import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

export const BAR_CHART_CONSTANTS = {
  ...COMMON_CHART_CONSTANTS,
  MAXIMUM_NUMBER_OF_BARS: 100,
  MAXIMUM_NUMBER_OF_GROUPS_PER_BAR: 50,
  MAXIMUM_WIDTH: 32,
  OUTER_PADDING_RATIO: 0.05,
  DEFAULT_INNER_PADDING: 4,
  MAXIMUM_VALUE_TICK_COUNT: 6,
  MINIMUM_VALUE_TICK_COUNT: 2,
  MINIMUM_WIDTH_PER_TICK: 100,
  MIN_TICK_SPACING_HEIGHT_RATIO: 2.5,
  TOOLTIP_OFFSET_PX: 2,
  TOOLTIP_SCROLLABLE_ITEM_THRESHOLD: 5,
  HOVER_BRIGHTNESS: 0.85,
  MINIMUM_BAR_WIDTH: 2,
  DATE_GRANULARITIES_WITHOUT_GAP_FILLING: new Set([
    ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
    ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR,
    ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
    ObjectRecordGroupByDateGranularity.NONE,
  ]),
} as const;
