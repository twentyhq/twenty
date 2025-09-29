import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconGizmo } from 'twenty-ui/display';

export const AXIS_NAME_SETTING: ChartSettingsItem = {
  Icon: IconGizmo,
  label: 'Axis name',
  id: 'axis-name',
  contextualTextPosition: 'right',
  hasSubMenu: true,
  isSubMenuOpened: false,
  onClick: () => {},
};
