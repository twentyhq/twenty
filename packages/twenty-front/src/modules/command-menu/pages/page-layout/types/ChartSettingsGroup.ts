import { type CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type CHART_CONFIGURATION_SETTING_LABELS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingLabels';
import { type IconComponent } from 'twenty-ui/display';

export type ChartSettingsGroup = {
  heading: string;
  items: ChartSettingsItem[];
};

export type ChartSettingsItem = {
  Icon: IconComponent;
  label: CHART_CONFIGURATION_SETTING_LABELS;
  id: CHART_CONFIGURATION_SETTING_IDS;
  description?: string;
  isBoolean: boolean;
  dependsOn?: CHART_CONFIGURATION_SETTING_IDS[];
};
