import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconFilters } from 'twenty-ui/display';

export const GROUP_BY_SETTING: ChartSettingsItem = {
  Icon: IconFilters,
  label: 'Group by',
  id: 'group-by-y',
  contextualTextPosition: 'right',
  hasSubMenu: true,
  isSubMenuOpened: false,
  onClick: () => {},
};
