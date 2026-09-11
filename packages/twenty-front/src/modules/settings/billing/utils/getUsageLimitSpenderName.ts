import { isNonEmptyString } from '@sniptt/guards';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { USAGE_LIMIT_SPENDER_TYPE_POOL_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypePoolLabels';
import { type UsageQuotaWithConsumption } from '@/settings/billing/types/UsageQuotaWithConsumption';
import { getUsageLimitLabel } from '@/settings/billing/utils/getUsageLimitLabel';

export const getUsageLimitSpenderName = (
  item: Pick<
    UsageQuotaWithConsumption,
    'spenderType' | 'spenderId' | 'spenderLabel'
  >,
): string => {
  if (isDefined(item.spenderLabel)) {
    return item.spenderLabel;
  }

  // a limit outlives the user or key it targets, and the API sends no label once it is gone
  if (isNonEmptyString(item.spenderId)) {
    return t`Unknown spender`;
  }

  const poolLabel = getUsageLimitLabel(
    USAGE_LIMIT_SPENDER_TYPE_POOL_LABELS,
    item.spenderType,
  );

  return isDefined(poolLabel) ? t(poolLabel) : item.spenderType;
};
