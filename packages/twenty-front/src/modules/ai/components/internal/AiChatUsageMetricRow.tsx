import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { MetricRow } from 'twenty-ui/components/data-display';
import { type IconComponent } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme } from 'twenty-ui/theme';

import { type AiChatUsage } from '@/ai/types/AiChatUsage';
import { computeDaysUntilReset } from '@/ai/utils/computeDaysUntilReset';
import { getAiChatUsageLabel } from '@/ai/utils/getAiChatUsageLabel';
import { computeUsageLimitProgress } from '@/settings/billing/utils/computeUsageLimitProgress';
import { getUsageLimitRingColor } from '@/settings/billing/utils/getUsageLimitRingColor';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

type AiChatUsageMetricRowProps = {
  Icon: IconComponent;
  label: string;
  tooltip?: string;
  usage: Pick<AiChatUsage, 'limitValue' | 'consumedValue' | 'periodEnd'> | null;
  isLoading?: boolean;
  hasError?: boolean;
};

export const AiChatUsageMetricRow = ({
  Icon,
  label,
  tooltip,
  usage,
  isLoading = false,
  hasError = false,
}: AiChatUsageMetricRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const creditPercentage = isDefined(usage)
    ? (computeUsageLimitProgress(usage)?.consumedPercentage ?? null)
    : null;

  const usageLabelInput = {
    loading: isLoading,
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
      progress={isLoading || hasError ? 0 : (creditPercentage ?? 0)}
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
      {isDefined(tooltip) ? (
        <Tooltip content={tooltip} delay={TooltipDelay.shortDelay}>
          <span>{label}</span>
        </Tooltip>
      ) : (
        label
      )}
    </MetricRow>
  );
};
