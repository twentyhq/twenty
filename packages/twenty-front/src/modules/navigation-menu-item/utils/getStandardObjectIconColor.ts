import type { ThemeColor } from 'twenty-ui/theme';

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

export const getStandardObjectIconColor = (
  nameSingular: string,
): ThemeColor | undefined =>
  STANDARD_OBJECT_ICON_COLOR[nameSingular as CoreObjectNameSingular];
