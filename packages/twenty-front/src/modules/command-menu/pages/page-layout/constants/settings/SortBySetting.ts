import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconArrowsSort } from 'twenty-ui/display';

export const SORT_BY_X_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconArrowsSort,
  label: 'Sort by',
  id: 'sort-by-x',
};
