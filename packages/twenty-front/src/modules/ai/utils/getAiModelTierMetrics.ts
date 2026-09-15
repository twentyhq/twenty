import { t } from '@lingui/core/macro';
import { AI_MODEL_TIERS } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBolt,
  IconBrain,
  IconCoins,
  type IconComponent,
} from 'twenty-ui/icon';

import { type ResolvedAiModelTier } from '@/ai/types/ResolvedAiModelTier';
import { formatMetricDelta } from '@/ai/utils/formatMetricDelta';
import { formatNumber } from '~/utils/format/formatNumber';

const BALANCED_STEP = AI_MODEL_TIERS.indexOf('balanced');

type TierMetric = {
  key: string;
  Icon: IconComponent;
  deltaPercent: number | undefined;
  tooltipTitle?: string;
  description: string;
};

const getComparison = (
  delta: number,
  labels: { multiplier: string; lower: string; higher: string; equal: string },
) => {
  if (delta >= 100) return labels.multiplier;
  if (delta < 0) return labels.lower;
  if (delta === 0) return labels.equal;
  return labels.higher;
};

const hasDeltaToShow = (
  metric: TierMetric,
): metric is TierMetric & { deltaPercent: number } =>
  isDefined(metric.deltaPercent);

export const getAiModelTierMetrics = (resolvedTier: ResolvedAiModelTier) => {
  const selectedStep = AI_MODEL_TIERS.indexOf(resolvedTier.tier);
  const model = resolvedTier.model;

  const intelligenceDelta = resolvedTier.intelligenceDeltaPercent ?? 0;
  const intelligenceComparison = getComparison(intelligenceDelta, {
    multiplier: t`${formatMetricDelta(intelligenceDelta)} the score of Balanced`,
    lower: t`${formatNumber(Math.abs(intelligenceDelta))}% lower score than Balanced`,
    higher: t`${formatNumber(intelligenceDelta)}% higher score than Balanced`,
    equal: t`Same score as Balanced`,
  });
  const intelligenceScore = t`Intelligence score: ${formatNumber(model?.intelligenceIndex ?? 0)}`;
  const costDelta = resolvedTier.costDeltaPercent ?? 0;
  const costComparison = getComparison(costDelta, {
    multiplier: t`${formatMetricDelta(costDelta)} the cost of Balanced.`,
    lower: t`${formatNumber(Math.abs(costDelta))}% lower cost than Balanced.`,
    higher: t`${formatNumber(costDelta)}% higher cost than Balanced.`,
    equal: t`Same cost as Balanced.`,
  });
  // Below Balanced the gain is speed, above it intelligence; cost moves with
  // both, so each side shows the two figures that explain the trade.
  const candidateMetrics: TierMetric[] = [
    ...(selectedStep < BALANCED_STEP
      ? [
          {
            key: 'speed',
            Icon: IconBolt,
            deltaPercent: resolvedTier.speedDeltaPercent,
            description:
              (resolvedTier.speedDeltaPercent ?? 0) >= 100
                ? t`${formatNumber(model?.outputTokensPerSecond ?? 0)} tokens/s, ${formatMetricDelta(resolvedTier.speedDeltaPercent ?? 0)} the speed of Balanced Mode.`
                : t`${formatNumber(model?.outputTokensPerSecond ?? 0)} tokens/s, a ${formatMetricDelta(resolvedTier.speedDeltaPercent ?? 0)} change in speed compared with Balanced Mode.`,
          },
        ]
      : []),
    ...(selectedStep !== BALANCED_STEP
      ? [
          {
            key: 'cost',
            Icon: IconCoins,
            deltaPercent: resolvedTier.costDeltaPercent,
            description: costComparison,
          },
        ]
      : []),
    ...(selectedStep > BALANCED_STEP
      ? [
          {
            key: 'intelligence',
            Icon: IconBrain,
            deltaPercent: resolvedTier.intelligenceDeltaPercent,
            tooltipTitle: intelligenceScore,
            description: intelligenceComparison,
          },
        ]
      : []),
  ];

  return candidateMetrics.filter(hasDeltaToShow);
};
