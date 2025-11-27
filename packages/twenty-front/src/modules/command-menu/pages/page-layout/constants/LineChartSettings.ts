import { AXIS_NAME_SETTING } from '@/command-menu/pages/page-layout/constants/settings/AxisNameSetting';
import { CHART_DATA_SOURCE_SETTING } from '@/command-menu/pages/page-layout/constants/settings/ChartDataSourceSetting';
import { COLORS_SETTING } from '@/command-menu/pages/page-layout/constants/settings/ColorsSetting';
import { DATA_DISPLAY_X_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DataDisplayXSetting';
import { DATA_DISPLAY_Y_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DataDisplayYSetting';
import { DATA_LABELS_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DataLabelsSetting';
import { DATE_GRANULARITY_X_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DateGranularityXSetting';
import { DATE_GRANULARITY_Y_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DateGranularityYSetting';
import { FILTER_SETTING } from '@/command-menu/pages/page-layout/constants/settings/FilterSetting';
import { GROUP_BY_SETTING } from '@/command-menu/pages/page-layout/constants/settings/GroupBySetting';
import { OMIT_NULL_VALUES_SETTING } from '@/command-menu/pages/page-layout/constants/settings/OmitNullValuesSetting';
import { PRIMARY_SORT_BY_SETTING } from '@/command-menu/pages/page-layout/constants/settings/PrimarySortBySetting';
import { RANGE_MAX_SETTING } from '@/command-menu/pages/page-layout/constants/settings/RangeMaxSetting';
import { RANGE_MIN_SETTING } from '@/command-menu/pages/page-layout/constants/settings/RangeMinSetting';
import { SHOW_LEGEND_SETTING } from '@/command-menu/pages/page-layout/constants/settings/ShowLegendSetting';
import { SORT_BY_GROUP_BY_FIELD_SETTING } from '@/command-menu/pages/page-layout/constants/settings/SortByGroupByFieldSetting';
import { STACKED_LINES_SETTING } from '@/command-menu/pages/page-layout/constants/settings/StackedLineSettings';
import { type ChartSettingsGroup } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';

export const LINE_CHART_SETTINGS: ChartSettingsGroup[] = [
  {
    heading: 'Data',
    items: [CHART_DATA_SOURCE_SETTING, FILTER_SETTING],
  },
  {
    heading: 'X axis',
    items: [
      DATA_DISPLAY_X_SETTING,
      DATE_GRANULARITY_X_SETTING,
      PRIMARY_SORT_BY_SETTING,
      OMIT_NULL_VALUES_SETTING,
    ],
  },
  {
    heading: 'Y axis',
    items: [
      DATA_DISPLAY_Y_SETTING,
      GROUP_BY_SETTING,
      DATE_GRANULARITY_Y_SETTING,
      SORT_BY_GROUP_BY_FIELD_SETTING,
      RANGE_MIN_SETTING,
      RANGE_MAX_SETTING,
    ],
  },
  {
    heading: 'Style',
    items: [
      COLORS_SETTING,
      AXIS_NAME_SETTING,
      STACKED_LINES_SETTING,
      DATA_LABELS_SETTING,
      SHOW_LEGEND_SETTING,
    ],
  },
];
