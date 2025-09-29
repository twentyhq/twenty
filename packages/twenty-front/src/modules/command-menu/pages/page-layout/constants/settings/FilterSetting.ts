import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconFilter } from 'twenty-ui/display';

export const FILTER_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconFilter,
  label: 'Filter',
  id: 'filter',
};
