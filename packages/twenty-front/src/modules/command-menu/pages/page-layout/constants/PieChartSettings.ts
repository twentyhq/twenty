import { CHART_DATA_SOURCE_SETTING } from '@/command-menu/pages/page-layout/constants/settings/ChartDataSourceSetting';
import { COLORS_SETTING } from '@/command-menu/pages/page-layout/constants/settings/ColorsSetting';
import { DATA_DISPLAY_PIE_CHART_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DataDisplayPieChartSetting';
import { DATA_LABELS_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DataLabelsSetting';
import { DATE_GRANULARITY_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DateGranularitySetting';
import { EACH_SLICE_REPRESENTS_SETTING } from '@/command-menu/pages/page-layout/constants/settings/EachSliceRepresentsSetting';
import { FILTER_SETTING } from '@/command-menu/pages/page-layout/constants/settings/FilterSetting';
import { PRIMARY_SORT_BY_SETTING } from '@/command-menu/pages/page-layout/constants/settings/PrimarySortBySetting';
import { SHOW_LEGEND_SETTING } from '@/command-menu/pages/page-layout/constants/settings/ShowLegendSetting';
import { type ChartSettingsGroup } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';

export const PIE_CHART_SETTINGS: ChartSettingsGroup[] = [
  {
    heading: 'Data',
    items: [
      CHART_DATA_SOURCE_SETTING,
      FILTER_SETTING,
      DATA_DISPLAY_PIE_CHART_SETTING,
      DATE_GRANULARITY_SETTING,
      EACH_SLICE_REPRESENTS_SETTING,
      PRIMARY_SORT_BY_SETTING,
    ],
  },
  {
    heading: 'Style',
    items: [COLORS_SETTING, DATA_LABELS_SETTING, SHOW_LEGEND_SETTING],
  },
];
