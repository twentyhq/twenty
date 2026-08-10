import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { BillingCreditGrantType } from '~/generated-admin/graphql';

export const CREDIT_GRANT_TYPE_LABELS: Record<
  BillingCreditGrantType,
  MessageDescriptor
> = {
  [BillingCreditGrantType.COMPENSATION]: msg`Compensation`,
  [BillingCreditGrantType.PARTNERSHIP]: msg`Partnership`,
  [BillingCreditGrantType.MANUAL_ADJUSTMENT]: msg`Manual adjustment`,
  [BillingCreditGrantType.ONBOARDING_REWARD]: msg`Onboarding reward`,
  [BillingCreditGrantType.ROLLOVER]: msg`Rollover`,
};
