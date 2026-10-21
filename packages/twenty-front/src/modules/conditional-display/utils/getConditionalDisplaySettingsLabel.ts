import { t } from '@lingui/core/macro';
import { type ConditionalDisplaySurface } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalDisplaySettingsLabel = (
  surface: ConditionalDisplaySurface,
): string => {
  switch (surface) {
    case 'navigationMenuItem':
      return t`Visible to`;
    case 'pageLayoutWidget':
    case 'pageLayoutTab':
    case 'viewField':
    case 'commandMenuItem':
      return t`Visibility`;
    default:
      return assertUnreachable(surface);
  }
};
