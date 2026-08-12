import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { BillingCreditGrantType } from '~/generated-admin/graphql';

export const CREDIT_GRANT_TYPE_LABELS: Record<
  BillingCreditGrantType,
  MessageDescriptor
> = {
  [BillingCreditGrantType.COMPENSATION]: msg`Compensation`,
  [BillingCreditGrantType.SALES]: msg`Sales`,
  [BillingCreditGrantType.ONBOARDING_REWARD]: msg`Onboarding reward`,
  [BillingCreditGrantType.ROLLOVER]: msg`Rollover`,
};
