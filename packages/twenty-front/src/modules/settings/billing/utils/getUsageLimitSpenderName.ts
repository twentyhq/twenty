import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { USAGE_LIMIT_SPENDER_TYPE_POOL_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypePoolLabels';
import { type UsageQuotaWithConsumption } from '@/settings/billing/types/UsageQuotaWithConsumption';
import { getUsageLimitLabel } from '@/settings/billing/utils/getUsageLimitLabel';

export const getUsageLimitSpenderName = (
  item: Pick<UsageQuotaWithConsumption, 'spenderType' | 'spenderLabel'>,
): string => {
  if (isDefined(item.spenderLabel)) {
    return item.spenderLabel;
  }

  const poolLabel = getUsageLimitLabel(
    USAGE_LIMIT_SPENDER_TYPE_POOL_LABELS,
    item.spenderType,
  );

  return isDefined(poolLabel) ? t(poolLabel) : item.spenderType;
};
