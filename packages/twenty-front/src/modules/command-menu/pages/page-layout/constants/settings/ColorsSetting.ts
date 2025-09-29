import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconColorSwatch } from 'twenty-ui/display';

export const COLORS_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconColorSwatch,
  label: 'Colors',
  id: 'colors',
};
