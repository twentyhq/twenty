import { isNonEmptyString } from '@sniptt/guards';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ThemeColor, MAIN_COLOR_NAMES } from 'twenty-ui/theme';

const SYSTEM_OBJECT_COLOR: ThemeColor = 'gray';

const STANDARD_OBJECT_FALLBACK_COLOR: Partial<
  Record<CoreObjectNameSingular, ThemeColor>
> = {
  [CoreObjectNameSingular.Company]: 'blue',
  [CoreObjectNameSingular.Person]: 'violet',
  [CoreObjectNameSingular.Task]: 'grass',
  [CoreObjectNameSingular.TaskTarget]: 'grass',
  [CoreObjectNameSingular.Note]: 'gold',
  [CoreObjectNameSingular.NoteTarget]: 'gold',
  [CoreObjectNameSingular.Opportunity]: 'cyan',
  [CoreObjectNameSingular.Dashboard]: 'pink',
  [CoreObjectNameSingular.Workflow]: 'iris',
  [CoreObjectNameSingular.WorkflowRun]: 'iris',
  [CoreObjectNameSingular.WorkflowVersion]: 'iris',
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

export const getObjectColorWithFallback = (
  objectMetadataItem:
    | (Pick<EnrichedObjectMetadataItem, 'color' | 'isSystem'> & {
        nameSingular?: string | null;
      })
    | null
    | undefined,
): ThemeColor => {
  if (!isDefined(objectMetadataItem)) {
    return SYSTEM_OBJECT_COLOR;
  }

  if (objectMetadataItem.isSystem) {
    return SYSTEM_OBJECT_COLOR;
  }

  if (isNonEmptyString(objectMetadataItem.color)) {
    return objectMetadataItem.color as ThemeColor;
  }

  const nameSingular = objectMetadataItem.nameSingular;

  if (!isNonEmptyString(nameSingular)) {
    return SYSTEM_OBJECT_COLOR;
  }

  return (
    STANDARD_OBJECT_FALLBACK_COLOR[nameSingular as CoreObjectNameSingular] ??
    getColorForCustomObject(nameSingular)
  );
};
