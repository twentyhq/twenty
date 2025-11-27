import { CHART_SETTINGS_HEADINGS } from '@/command-menu/pages/page-layout/constants/ChartSettingsHeadings';
import { CHART_DATA_SOURCE_SETTING } from '@/command-menu/pages/page-layout/constants/settings/ChartDataSourceSetting';
import { DATA_DISPLAY_AGGREGATE_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DataDisplayAggregateSetting';
import { FILTER_SETTING } from '@/command-menu/pages/page-layout/constants/settings/FilterSetting';
import { type ChartSettingsGroup } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';

export const AGGREGATE_CHART_SETTINGS: ChartSettingsGroup[] = [
  {
    heading: CHART_SETTINGS_HEADINGS.DATA,
    items: [
      CHART_DATA_SOURCE_SETTING,
      FILTER_SETTING,
      DATA_DISPLAY_AGGREGATE_SETTING,
    ],
  },
];
