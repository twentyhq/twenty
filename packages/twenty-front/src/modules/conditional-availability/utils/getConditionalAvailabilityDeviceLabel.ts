import { t } from '@lingui/core/macro';
import { type ConditionalAvailabilityDevice } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityDeviceLabel = ({
  device,
}: {
  device: ConditionalAvailabilityDevice;
}): string => {
  switch (device) {
    case 'DESKTOP':
      return t`Desktop`;
    case 'MOBILE':
      return t`Mobile`;
    default:
      return assertUnreachable(device);
  }
};
