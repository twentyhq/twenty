import { t } from '@lingui/core/macro';

const MAX_SOURCE_NAMES_TO_DISPLAY = 3;

export const getActorSourceFilterDisplayValue = (sourceNames: string[]) => {
  const sourceCount = sourceNames.length;

  return sourceCount > MAX_SOURCE_NAMES_TO_DISPLAY
    ? t`${sourceCount} source types`
    : sourceNames.join(', ');
};
