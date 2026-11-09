import { type DashboardFilterFieldResolution } from 'twenty-shared/types';

export type DashboardFilterWidgetSettingOption = {
  value: string;
  label: string;
  iconName?: string | null;
};

export type DashboardFilterWidgetSetting = {
  resolution: DashboardFilterFieldResolution;
  value: string;
  options: DashboardFilterWidgetSettingOption[];
};
