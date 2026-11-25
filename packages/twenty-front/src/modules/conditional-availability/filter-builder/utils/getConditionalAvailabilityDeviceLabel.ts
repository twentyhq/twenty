import { t } from '@lingui/core/macro';
import { type ConditionalEvaluationDevice } from 'twenty-shared/conditional-evaluation';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityDeviceLabel = ({
  device,
}: {
  device: ConditionalEvaluationDevice;
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
