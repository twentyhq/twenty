import { type ThemeColor } from 'twenty-ui/theme';

import { BillingCreditGrantType } from '~/generated-admin/graphql';

export const CREDIT_GRANT_TYPE_COLORS: Record<
  BillingCreditGrantType,
  ThemeColor
> = {
  [BillingCreditGrantType.COMPENSATION]: 'orange',
  [BillingCreditGrantType.PARTNERSHIP]: 'purple',
  [BillingCreditGrantType.MANUAL_ADJUSTMENT]: 'gray',
  [BillingCreditGrantType.ONBOARDING_REWARD]: 'blue',
  [BillingCreditGrantType.ROLLOVER]: 'green',
};
