import { type CHART_CONFIGURATION_SETTING_IDS } from '@/command-menu/pages/page-layout/types/ChartConfigurationSettingIds';
import { type MessageDescriptor } from '@lingui/core';
import { type ComponentType } from 'react';
import { type IconComponent } from 'twenty-ui/display';

export type ChartSettingsGroup = {
  heading: MessageDescriptor;
  items: ChartSettingsItem[];
};

export type ChartSettingsItem = {
  Icon: IconComponent;
  label: MessageDescriptor;
  id: CHART_CONFIGURATION_SETTING_IDS;
  description?: string;
  isBoolean: boolean;
  dependsOn?: CHART_CONFIGURATION_SETTING_IDS[];
  DropdownContent?: ComponentType;
  dropdownWidth?: number;
  isNumberInput?: boolean;
  isTextInput?: boolean;
  inputPlaceholder?: MessageDescriptor;
};
