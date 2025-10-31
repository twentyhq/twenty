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
import { RANGE_MAX_SETTING } from '@/command-menu/pages/page-layout/constants/settings/RangeMaxSetting';
import { RANGE_MIN_SETTING } from '@/command-menu/pages/page-layout/constants/settings/RangeMinSetting';
import { SORT_BY_GROUP_BY_FIELD_SETTING } from '@/command-menu/pages/page-layout/constants/settings/SortByGroupByFieldSetting';
import { SORT_BY_X_SETTING } from '@/command-menu/pages/page-layout/constants/settings/SortByXSetting';
import { STACKED_BARS_SETTING } from '@/command-menu/pages/page-layout/constants/settings/StackedBarsSetting';
import { type ChartSettingsGroup } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconAxisX, IconAxisY } from 'twenty-ui/display';
import { GraphType } from '~/generated-metadata/graphql';

export const getBarChartSettings = (
  graphType: GraphType.VERTICAL_BAR | GraphType.HORIZONTAL_BAR,
): ChartSettingsGroup[] => {
  const isHorizontal = graphType === GraphType.HORIZONTAL_BAR;

  const dataDisplayXIcon = isHorizontal ? IconAxisY : IconAxisX;
  const dataDisplayYIcon = isHorizontal ? IconAxisX : IconAxisY;

  const primaryAxisItems = [
    { ...DATA_DISPLAY_X_SETTING, Icon: dataDisplayXIcon },
    DATE_GRANULARITY_X_SETTING,
    SORT_BY_X_SETTING,
    OMIT_NULL_VALUES_SETTING,
  ];

  const secondaryAxisItems = [
    { ...DATA_DISPLAY_Y_SETTING, Icon: dataDisplayYIcon },
    GROUP_BY_SETTING,
    DATE_GRANULARITY_Y_SETTING,
    SORT_BY_GROUP_BY_FIELD_SETTING,
    RANGE_MIN_SETTING,
    RANGE_MAX_SETTING,
  ];

  const xAxisItems = isHorizontal ? secondaryAxisItems : primaryAxisItems;
  const yAxisItems = isHorizontal ? primaryAxisItems : secondaryAxisItems;

  return [
    {
      heading: 'Data',
      items: [CHART_DATA_SOURCE_SETTING, FILTER_SETTING],
    },
    {
      heading: 'X axis',
      items: xAxisItems,
    },
    {
      heading: 'Y axis',
      items: yAxisItems,
    },
    {
      heading: 'Style',
      items: [
        COLORS_SETTING,
        AXIS_NAME_SETTING,
        STACKED_BARS_SETTING,
        DATA_LABELS_SETTING,
      ],
    },
  ];
};
