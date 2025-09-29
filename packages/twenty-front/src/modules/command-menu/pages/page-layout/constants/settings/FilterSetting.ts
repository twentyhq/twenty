import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconFilter } from 'twenty-ui/display';

export const FILTER_SETTING: ChartSettingsItem = {
  Icon: IconFilter,
  label: 'Filter',
  id: 'filter',
  contextualTextPosition: 'right',
  hasSubMenu: true,
  isSubMenuOpened: false,
  onClick: () => {},
};
