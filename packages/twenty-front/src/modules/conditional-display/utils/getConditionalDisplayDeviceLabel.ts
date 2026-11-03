import { t } from '@lingui/core/macro';
import { type ConditionalDisplayDevice } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalDisplayDeviceLabel = (
  device: ConditionalDisplayDevice,
): string => {
  switch (device) {
    case 'DESKTOP':
      return t`Desktop`;
    case 'MOBILE':
      return t`Mobile`;
    default:
      return assertUnreachable(device);
  }
};
