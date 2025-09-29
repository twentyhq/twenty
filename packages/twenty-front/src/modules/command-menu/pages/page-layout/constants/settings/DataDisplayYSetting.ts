import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconAxisY } from 'twenty-ui/display';

export const DATA_DISPLAY_Y_SETTING: ChartSettingsItem = {
  Icon: IconAxisY,
  label: 'Data on display',
  id: 'data-on-display-y',
  contextualTextPosition: 'right',
  hasSubMenu: true,
  isSubMenuOpened: false,
  onClick: () => {},
};
