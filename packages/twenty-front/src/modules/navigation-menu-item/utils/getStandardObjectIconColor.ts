import { type ThemeColor, MAIN_COLOR_NAMES } from 'twenty-ui/theme';

import { DEFAULT_NAV_ITEM_ICON_COLOR } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultIconColor.constant';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const STANDARD_OBJECT_ICON_COLOR: Partial<
  Record<CoreObjectNameSingular, ThemeColor>
> = {
  [CoreObjectNameSingular.Company]: DEFAULT_NAV_ITEM_ICON_COLOR,
  [CoreObjectNameSingular.Person]: DEFAULT_NAV_ITEM_ICON_COLOR,
  [CoreObjectNameSingular.Task]: DEFAULT_NAV_ITEM_ICON_COLOR,
  [CoreObjectNameSingular.TaskTarget]: DEFAULT_NAV_ITEM_ICON_COLOR,
  [CoreObjectNameSingular.Note]: DEFAULT_NAV_ITEM_ICON_COLOR,
  [CoreObjectNameSingular.NoteTarget]: DEFAULT_NAV_ITEM_ICON_COLOR,
  [CoreObjectNameSingular.Opportunity]: DEFAULT_NAV_ITEM_ICON_COLOR,
  [CoreObjectNameSingular.Dashboard]: DEFAULT_NAV_ITEM_ICON_COLOR,
  [CoreObjectNameSingular.Workflow]: DEFAULT_NAV_ITEM_ICON_COLOR,
  [CoreObjectNameSingular.WorkflowRun]: DEFAULT_NAV_ITEM_ICON_COLOR,
  [CoreObjectNameSingular.WorkflowVersion]: DEFAULT_NAV_ITEM_ICON_COLOR,
};

const CUSTOM_OBJECT_ICON_COLORS: ThemeColor[] = MAIN_COLOR_NAMES.filter(
  (color) => color !== 'gray',
);

const getColorForCustomObject = (seed: string): ThemeColor => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }
  const index = Math.abs(hash) % CUSTOM_OBJECT_ICON_COLORS.length;
  return CUSTOM_OBJECT_ICON_COLORS[index];
};

export const getStandardObjectIconColor = (nameSingular: string): ThemeColor =>
  STANDARD_OBJECT_ICON_COLOR[nameSingular as CoreObjectNameSingular] ??
  getColorForCustomObject(nameSingular);
