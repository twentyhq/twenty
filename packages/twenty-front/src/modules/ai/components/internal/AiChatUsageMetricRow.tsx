import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { MetricRow } from 'twenty-ui/components/data-display';
import { type IconComponent } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { type AiChatUsage } from '@/ai/types/AiChatUsage';
import { computeDaysUntilReset } from '@/ai/utils/computeDaysUntilReset';
import { getAiChatUsageLabel } from '@/ai/utils/getAiChatUsageLabel';
import { computeUsageLimitProgress } from '@/settings/billing/utils/computeUsageLimitProgress';
import { getUsageLimitRingColor } from '@/settings/billing/utils/getUsageLimitRingColor';

type AiChatUsageMetricRowProps = {
  Icon: IconComponent;
  label: string;
  usage: Pick<AiChatUsage, 'limitValue' | 'consumedValue' | 'periodEnd'> | null;
  loading?: boolean;
  hasError?: boolean;
};

export const AiChatUsageMetricRow = ({
  Icon,
  label,
  usage,
  loading = false,
  hasError = false,
}: AiChatUsageMetricRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const creditPercentage = isDefined(usage)
    ? (computeUsageLimitProgress(usage)?.consumedPercentage ?? null)
    : null;

  const usageLabelInput = {
    loading,
    hasError,
    hasUsage: isDefined(usage),
    daysUntilReset: isDefined(usage?.periodEnd)
      ? computeDaysUntilReset(usage.periodEnd)
      : null,
    creditPercentage,
  };

  return (
    <MetricRow
      startIcon={<Icon size={theme.icon.size.sm} />}
      progress={loading || hasError ? 0 : (creditPercentage ?? 0)}
      value={getAiChatUsageLabel(usageLabelInput)}
      progressValueText={getAiChatUsageLabel({
        ...usageLabelInput,
        unavailableConsumptionLabel: t`Not available`,
      })}
      progressColor={getUsageLimitRingColor({
        consumedPercentage: creditPercentage ?? 0,
        isExhausted: creditPercentage === 100,
      })}
    >
      {label}
    </MetricRow>
  );
};
