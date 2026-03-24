import { isNonEmptyString } from '@sniptt/guards';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type ThemeColor, MAIN_COLOR_NAMES } from 'twenty-ui/theme';

const SYSTEM_OBJECT_COLOR: ThemeColor = 'gray';

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
  [CoreObjectNameSingular.Dashboard]: SYSTEM_OBJECT_COLOR,
  [CoreObjectNameSingular.Workflow]: SYSTEM_OBJECT_COLOR,
  [CoreObjectNameSingular.WorkflowRun]: SYSTEM_OBJECT_COLOR,
  [CoreObjectNameSingular.WorkflowVersion]: SYSTEM_OBJECT_COLOR,
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
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'nameSingular' | 'color' | 'isSystem'
  >,
): ThemeColor => {
  if (objectMetadataItem.isSystem) {
    return SYSTEM_OBJECT_COLOR;
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
