import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconArrowsSort } from 'twenty-ui/display';

export const SORT_BY_SETTING: ChartSettingsItem = {
  Icon: IconArrowsSort,
  label: 'Sort by',
  id: 'sort-by',
  contextualTextPosition: 'right',
  hasSubMenu: true,
  isSubMenuOpened: false,
  onClick: () => {},
};
