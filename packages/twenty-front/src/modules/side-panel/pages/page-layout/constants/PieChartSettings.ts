import { CHART_SETTINGS_HEADINGS } from '@/side-panel/pages/page-layout/constants/ChartSettingsHeadings';
import { CENTER_METRIC_SETTING } from '@/side-panel/pages/page-layout/constants/settings/CenterMetricSetting';
import { CHART_DATA_SOURCE_SETTING } from '@/side-panel/pages/page-layout/constants/settings/ChartDataSourceSetting';
import { COLORS_SETTING } from '@/side-panel/pages/page-layout/constants/settings/ColorsSetting';
import { DATA_DISPLAY_PIE_CHART_SETTING } from '@/side-panel/pages/page-layout/constants/settings/DataDisplayPieChartSetting';
import { DATA_LABELS_SETTING } from '@/side-panel/pages/page-layout/constants/settings/DataLabelsSetting';
import { DATE_GRANULARITY_SETTING } from '@/side-panel/pages/page-layout/constants/settings/DateGranularitySetting';
import { EACH_SLICE_REPRESENTS_SETTING } from '@/side-panel/pages/page-layout/constants/settings/EachSliceRepresentsSetting';
import { FILTER_SETTING } from '@/side-panel/pages/page-layout/constants/settings/FilterSetting';
import { HIDE_EMPTY_CATEGORY_SETTING } from '@/side-panel/pages/page-layout/constants/settings/HideEmptyCategorySetting';
import { PRIMARY_SORT_BY_SETTING } from '@/side-panel/pages/page-layout/constants/settings/PrimarySortBySetting';
import { SHOW_LEGEND_SETTING } from '@/side-panel/pages/page-layout/constants/settings/ShowLegendSetting';
import { SPLIT_MULTI_VALUE_FIELDS_X_SETTING } from '@/side-panel/pages/page-layout/constants/settings/SplitMultiValueFieldsXSetting';
import { type ChartSettingsGroup } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';

export const PIE_CHART_SETTINGS: ChartSettingsGroup[] = [
  {
    heading: CHART_SETTINGS_HEADINGS.DATA,
    items: [
      CHART_DATA_SOURCE_SETTING,
      FILTER_SETTING,
      DATA_DISPLAY_PIE_CHART_SETTING,
      DATE_GRANULARITY_SETTING,
      EACH_SLICE_REPRESENTS_SETTING,
      PRIMARY_SORT_BY_SETTING,
      HIDE_EMPTY_CATEGORY_SETTING,
      SPLIT_MULTI_VALUE_FIELDS_X_SETTING,
    ],
  },
  {
    heading: CHART_SETTINGS_HEADINGS.STYLE,
    items: [
      COLORS_SETTING,
      DATA_LABELS_SETTING,
      SHOW_LEGEND_SETTING,
      CENTER_METRIC_SETTING,
    ],
  },
];
