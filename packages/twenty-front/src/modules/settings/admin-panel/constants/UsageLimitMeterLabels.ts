import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const ADMIN_USAGE_LIMIT_METER_LABELS: Record<string, MessageDescriptor> =
  {
    creditsUsedMicro: msg`Credits`,
    quantity: msg`Operations`,
    bytes: msg`Bytes`,
  };
