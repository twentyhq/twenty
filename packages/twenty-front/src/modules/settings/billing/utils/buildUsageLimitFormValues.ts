import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { type UsageQuotaWithConsumption } from '@/settings/billing/types/UsageQuotaWithConsumption';
import { USAGE_LIMIT_PERIOD_UNIT_LABELS } from '@/settings/billing/constants/UsageLimitPeriodUnitLabels';
import { USAGE_LIMIT_SPENDER_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypeLabels';
import { getUsageLimitInputScale } from '@/settings/billing/utils/getUsageLimitInputScale';
import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';

export const buildUsageLimitFormValues = (
  item: UsageQuotaWithConsumption,
): UsageLimitFormValues => {
  const limitValue = Number(item.limitValue);

  return {
    resourceType: item.resourceType ?? null,
    operationType: item.operationType,
    spenderType: isKeyOfRecord(
      USAGE_LIMIT_SPENDER_TYPE_LABELS,
      item.spenderType,
    )
      ? item.spenderType
      : null,
    spenderId: item.spenderId ?? '',
    unit: item.unit,
    periodUnit: isKeyOfRecord(USAGE_LIMIT_PERIOD_UNIT_LABELS, item.periodUnit)
      ? item.periodUnit
      : null,
    limitValue: String(limitValue / getUsageLimitInputScale(item.unit)),
  };
};
