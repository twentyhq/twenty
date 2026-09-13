import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { type UsageQuotaWithConsumption } from '@/settings/billing/types/UsageQuotaWithConsumption';
import { USAGE_LIMIT_METER_LABELS } from '@/settings/billing/constants/UsageLimitMeterLabels';
import { USAGE_LIMIT_PERIOD_UNIT_LABELS } from '@/settings/billing/constants/UsageLimitPeriodUnitLabels';
import { USAGE_LIMIT_SPENDER_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitSpenderTypeLabels';
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
    meter: isKeyOfRecord(USAGE_LIMIT_METER_LABELS, item.meter)
      ? item.meter
      : null,
    periodUnit: isKeyOfRecord(USAGE_LIMIT_PERIOD_UNIT_LABELS, item.periodUnit)
      ? item.periodUnit
      : null,
    limitValue:
      isDefined(item.meter) && item.meter === 'creditsUsedMicro'
        ? String(limitValue / INTERNAL_CREDITS_PER_DISPLAY_CREDIT)
        : String(limitValue),
  };
};
