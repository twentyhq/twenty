import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';

import { BillingArrangementStatus } from '~/generated-admin/graphql';

export const BILLING_ARRANGEMENT_STATUS_TAGS: Record<
  BillingArrangementStatus,
  { label: MessageDescriptor; color: ThemeColor }
> = {
  [BillingArrangementStatus.ACTIVE]: { label: msg`Active`, color: 'green' },
  [BillingArrangementStatus.SCHEDULED]: {
    label: msg`Scheduled`,
    color: 'blue',
  },
  [BillingArrangementStatus.ENDED]: { label: msg`Ended`, color: 'gray' },
  [BillingArrangementStatus.ONE_TIME]: {
    label: msg`One-time`,
    color: 'gray',
  },
};
