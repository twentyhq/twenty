import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { BillingArrangementSeatCapMode } from '~/generated-admin/graphql';

export const BILLING_ARRANGEMENT_SEAT_CAP_MODE_LABELS: Record<
  BillingArrangementSeatCapMode,
  MessageDescriptor
> = {
  [BillingArrangementSeatCapMode.SOFT]: msg`Soft cap`,
  [BillingArrangementSeatCapMode.HARD]: msg`Hard cap`,
};
