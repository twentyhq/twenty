import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconDatabase } from 'twenty-ui/display';

export const TOTAL_VALUE_SOURCE_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconDatabase,
  label: 'Total Value Source',
  id: 'total-source',
};
