import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type UsageQuotaWithConsumption } from '@/settings/billing/types/UsageQuotaWithConsumption';

// a limit outlives the user or key it targets, and the API sends no label once it is gone
export const hasKnownUsageLimitSpender = (
  quota: Pick<UsageQuotaWithConsumption, 'spenderId' | 'spenderLabel'>,
): boolean =>
  !isNonEmptyString(quota.spenderId) || isDefined(quota.spenderLabel);
