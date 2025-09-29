import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconDatabase } from 'twenty-ui/display';

export const CHART_DATA_SOURCE_SETTING: ChartSettingsItem = {
  Icon: IconDatabase,
  label: 'Source',
  id: 'source',
  contextualTextPosition: 'right',
  hasSubMenu: true,
  isSubMenuOpened: false,
  onClick: () => {},
};
