import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconTag } from 'twenty-ui/display';

export const DATA_LABELS_SETTING: ChartSettingsItem = {
  Icon: IconTag,
  label: 'Data labels',
  id: 'data-labels',
  contextualTextPosition: 'right',
  hasSubMenu: true,
  isSubMenuOpened: false,
  onClick: () => {},
};
