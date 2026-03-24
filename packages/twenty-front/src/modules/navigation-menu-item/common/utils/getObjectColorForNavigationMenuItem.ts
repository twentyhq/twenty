import { isNonEmptyString } from '@sniptt/guards';

import { DEFAULT_NAV_ITEM_ICON_COLOR } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultIconColor.constant';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type ThemeColor, MAIN_COLOR_NAMES } from 'twenty-ui/theme';

const STANDARD_OBJECT_FALLBACK_COLOR: Partial<
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
  const colorIndex = Math.abs(hash) % CUSTOM_OBJECT_ICON_COLORS.length;
  return CUSTOM_OBJECT_ICON_COLORS[colorIndex];
};

export const getObjectColorForNavigationMenuItem = (
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'nameSingular' | 'color' | 'isSystem'
  >,
): ThemeColor => {
  if (objectMetadataItem.isSystem) {
    return DEFAULT_NAV_ITEM_ICON_COLOR;
  }

  if (isNonEmptyString(objectMetadataItem.color)) {
    return objectMetadataItem.color as ThemeColor;
  }

  return (
    STANDARD_OBJECT_FALLBACK_COLOR[
      objectMetadataItem.nameSingular as CoreObjectNameSingular
    ] ?? getColorForCustomObject(objectMetadataItem.nameSingular)
  );
};
