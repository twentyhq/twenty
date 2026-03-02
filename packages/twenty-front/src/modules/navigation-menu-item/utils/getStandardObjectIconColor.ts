import { type ThemeColor, MAIN_COLOR_NAMES } from 'twenty-ui/theme';

import { DEFAULT_NAV_ITEM_ICON_COLOR } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultIconColor.constant';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

const STANDARD_OBJECT_ICON_COLOR: Partial<
  Record<CoreObjectNameSingular, ThemeColor>
> = {
  [CoreObjectNameSingular.Company]: 'blue',
  [CoreObjectNameSingular.Person]: 'blue',
  [CoreObjectNameSingular.Task]: 'turquoise',
  [CoreObjectNameSingular.TaskTarget]: 'turquoise',
  [CoreObjectNameSingular.Note]: 'turquoise',
  [CoreObjectNameSingular.NoteTarget]: 'turquoise',
  [CoreObjectNameSingular.Opportunity]: 'red',
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
