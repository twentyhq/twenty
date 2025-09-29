import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconDatabase } from 'twenty-ui/display';

export const CHART_DATA_SOURCE_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconDatabase,
  label: 'Source',
  id: 'source',
};
