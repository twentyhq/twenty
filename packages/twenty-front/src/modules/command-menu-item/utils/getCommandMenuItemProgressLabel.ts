import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getCommandMenuItemProgressLabel = (progress?: number): string =>
  isDefined(progress) && progress > 0
    ? `${Math.round(progress)}%`
    : t`Preparing…`;
