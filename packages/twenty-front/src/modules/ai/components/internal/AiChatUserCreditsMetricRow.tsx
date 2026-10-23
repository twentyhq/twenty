import { useLingui } from '@lingui/react/macro';
import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { MetricRow } from 'twenty-ui/components/data-display';
import { IconCoins } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { useAiChatUserCreditsUsage } from '@/ai/hooks/useAiChatUserCreditsUsage';
import { computeDaysUntilReset } from '@/ai/utils/computeDaysUntilReset';
import { getAiChatUserCreditsLabel } from '@/ai/utils/getAiChatUserCreditsLabel';
import { computeUsageLimitProgress } from '@/settings/billing/utils/computeUsageLimitProgress';
import { getUsageLimitRingColor } from '@/settings/billing/utils/getUsageLimitRingColor';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';

export const AiChatUserCreditsMetricRow = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { formatUsageValue } = useUsageValueFormatter();

  const { userCreditsUsage } = useAiChatUserCreditsUsage();

  if (!isDefined(userCreditsUsage)) {
    return null;
  }

  const progress = computeUsageLimitProgress(userCreditsUsage);

  const label = getAiChatUserCreditsLabel({
    formattedRemainingCredits: isDefined(progress)
      ? formatUsageValue(
          progress.remainingValue / INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
        )
      : null,
    daysUntilReset: computeDaysUntilReset(userCreditsUsage.periodEnd),
  });

  return (
    <MetricRow
      startIcon={<IconCoins size={theme.icon.size.sm} />}
      progress={progress?.consumedPercentage ?? 0}
      value={label}
      progressValueText={label}
      progressColor={getUsageLimitRingColor({
        consumedPercentage: progress?.consumedPercentage ?? 0,
        isExhausted: progress?.remainingValue === 0,
      })}
    >
      {t`Your credits`}
    </MetricRow>
  );
};
