import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconAxisX } from 'twenty-ui/display';

export const DATA_DISPLAY_X_SETTING: ChartSettingsItem = {
  Icon: IconAxisX,
  label: 'Data on display',
  id: 'data-on-display-x',
  contextualTextPosition: 'right',
  hasSubMenu: true,
  isSubMenuOpened: false,
  onClick: () => {},
};
