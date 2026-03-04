import { CHART_SETTINGS_HEADINGS } from '@/command-menu/pages/page-layout/constants/ChartSettingsHeadings';
import { CHART_DATA_SOURCE_SETTING } from '@/command-menu/pages/page-layout/constants/settings/ChartDataSourceSetting';
import { DATA_LABELS_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DataLabelsSetting';
import { FILTER_SETTING } from '@/command-menu/pages/page-layout/constants/settings/FilterSetting';
import { type ChartSettingsGroup } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';

export const GAUGE_CHART_SETTINGS: ChartSettingsGroup[] = [
  {
    heading: CHART_SETTINGS_HEADINGS.DATA,
    items: [CHART_DATA_SOURCE_SETTING, FILTER_SETTING],
  },
  {
    heading: CHART_SETTINGS_HEADINGS.STYLE,
    items: [DATA_LABELS_SETTING],
  },
];
