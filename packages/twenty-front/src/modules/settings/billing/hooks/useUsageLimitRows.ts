import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCoins } from 'twenty-ui/icon';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { USAGE_LIMIT_OPERATION_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitOperationTypeIcons';
import { USAGE_LIMIT_PERIOD_NAME_LABELS } from '@/settings/billing/constants/UsageLimitPeriodNameLabels';
import { USAGE_LIMIT_RESOURCE_TYPE_LABELS } from '@/settings/billing/constants/UsageLimitResourceTypeLabels';
import { AVATAR_SPENDER_TYPES } from '@/settings/billing/constants/AvatarSpenderTypes';
import { useUsageLimitFormatter } from '@/settings/billing/hooks/useUsageLimitFormatter';
import { useUsageLimitSpenderOptions } from '@/settings/billing/hooks/useUsageLimitSpenderOptions';
import { type UsageLimitRow } from '@/settings/billing/types/UsageLimitRow';
import { type UsageQuotaWithConsumption } from '@/settings/billing/types/UsageQuotaWithConsumption';
import { computeUsageLimitProgress } from '@/settings/billing/utils/computeUsageLimitProgress';
import { getUsageLimitLabel } from '@/settings/billing/utils/getUsageLimitLabel';
import { getUsageLimitSpenderName } from '@/settings/billing/utils/getUsageLimitSpenderName';
import { isCreditsMeter } from '@/settings/billing/utils/isCreditsMeter';
import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';
import { getUsageOperationTypeLabel } from '@/settings/usage/utils/getUsageOperationTypeLabel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useUsageLimitRows = (
  quotas: UsageQuotaWithConsumption[],
): UsageLimitRow[] => {
  const { t } = useLingui();
  const { formatLimitValue } = useUsageLimitFormatter();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { spenderOptionsByType } = useUsageLimitSpenderOptions(
    AVATAR_SPENDER_TYPES.filter((spenderType) =>
      quotas.some((quota) => quota.spenderType === spenderType),
    ),
  );

  const avatarUrlBySpenderId = new Map(
    Object.values(spenderOptionsByType)
      .flat()
      .map((option) => [option.id, option.avatarUrl ?? null]),
  );

  const getName = (quota: UsageQuotaWithConsumption): string => {
    const operationLabel = getUsageOperationTypeLabel(quota.operationType);
    const resourceText = t(
      USAGE_LIMIT_RESOURCE_TYPE_LABELS[quota.resourceType],
    );
    const operationText = isDefined(operationLabel)
      ? t(operationLabel)
      : quota.operationType;

    return `${resourceText} · ${operationText}`;
  };

  const getSpenderName = (quota: UsageQuotaWithConsumption): string =>
    quota.spenderType === 'workspace'
      ? (currentWorkspace?.displayName ?? getUsageLimitSpenderName(quota))
      : getUsageLimitSpenderName(quota);

  const getPeriodName = (periodUnit: string): string => {
    const periodLabel = getUsageLimitLabel(
      USAGE_LIMIT_PERIOD_NAME_LABELS,
      periodUnit,
    );

    return isDefined(periodLabel) ? t(periodLabel) : periodUnit;
  };

  return quotas.map((quota) => {
    const limitValue = Number(quota.limitValue);
    const consumedValue = isDefined(quota.consumedValue)
      ? Number(quota.consumedValue)
      : null;
    const progress = computeUsageLimitProgress({ limitValue, consumedValue });

    return {
      id: quota.id,
      name: getName(quota),
      NameIcon: isKeyOfRecord(
        USAGE_LIMIT_OPERATION_TYPE_ICONS,
        quota.operationType,
      )
        ? USAGE_LIMIT_OPERATION_TYPE_ICONS[quota.operationType]
        : IconCoins,
      spenderName: getSpenderName(quota),
      spenderAvatarUrl: isDefined(quota.spenderId)
        ? (avatarUrlBySpenderId.get(quota.spenderId) ?? null)
        : null,
      spenderType: quota.spenderType,
      resourceType: quota.resourceType,
      consumedPercentage: progress?.consumedPercentage ?? null,
      consumedText: isDefined(consumedValue)
        ? formatLimitValue({
            value: consumedValue,
            meter: quota.meter,
            operationType: quota.operationType,
          })
        : null,
      limitText: formatLimitValue({
        value: limitValue,
        meter: quota.meter,
        operationType: quota.operationType,
      }),
      isCreditsMeter: isCreditsMeter(quota.meter),
      isExhausted: progress?.remainingValue === 0,
      periodName: getPeriodName(quota.periodUnit),
    };
  });
};
