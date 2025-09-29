import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconColorSwatch } from 'twenty-ui/display';

export const COLORS_SETTING: ChartSettingsItem = {
  Icon: IconColorSwatch,
  label: 'Colors',
  id: 'colors',
  contextualTextPosition: 'right',
  hasSubMenu: true,
  isSubMenuOpened: false,
  onClick: () => {},
};
