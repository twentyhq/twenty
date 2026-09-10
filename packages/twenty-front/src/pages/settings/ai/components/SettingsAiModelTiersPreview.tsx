import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { type ResolvedAiModelTier } from '@/ai/types/ResolvedAiModelTier';
import { getAiModelBlendedCostPerMillionTokens } from '@/settings/ai/utils/getAiModelBlendedCostPerMillionTokens';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { formatNumber } from '~/utils/format/formatNumber';

const GRID_TEMPLATE_COLUMNS = '1fr 1fr 1fr 1fr 1.4fr';
const EMPTY_VALUE = '–';

const StyledInheritedValue = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const INHERITED_BENCHMARK_CLASS_NAME = 'ai-model-tier-inherited-benchmark';

// The reading belongs to the base model, so it is dimmed and explained rather
// than passed off as a measurement at this effort.
const renderBenchmarkValue = (tier: ResolvedAiModelTier, value: string) =>
  (tier.model?.isBenchmarkInherited ?? false) && value !== EMPTY_VALUE ? (
    <StyledInheritedValue className={INHERITED_BENCHMARK_CLASS_NAME}>
      {value}
    </StyledInheritedValue>
  ) : (
    value
  );

const formatSpeed = (tier: ResolvedAiModelTier) =>
  isDefined(tier.model?.outputTokensPerSecond)
    ? t`${formatNumber(tier.model.outputTokensPerSecond, { decimals: 0 })} tokens/s`
    : EMPTY_VALUE;

const formatIntelligence = (tier: ResolvedAiModelTier) =>
  isDefined(tier.model?.intelligenceIndex)
    ? formatNumber(tier.model.intelligenceIndex, { decimals: 0 })
    : EMPTY_VALUE;

// Artificial Analysis measures a cost per task at the same time as the index.
// The column only uses it when every tier has one; otherwise the rows would
// mix a price per task with a price per million tokens and stop comparing.
const formatCost = ({
  tier,
  hasCostPerTaskForEveryTier,
}: {
  tier: ResolvedAiModelTier;
  hasCostPerTaskForEveryTier: boolean;
}) => {
  if (!isDefined(tier.model)) {
    return EMPTY_VALUE;
  }

  if (hasCostPerTaskForEveryTier && isDefined(tier.model.costPerTask)) {
    return t`$${formatNumber(tier.model.costPerTask, { decimals: 2 })} / task`;
  }

  const blendedCost = getAiModelBlendedCostPerMillionTokens(tier.model);

  return isDefined(blendedCost)
    ? t`$${formatNumber(blendedCost, { decimals: 2 })} / 1M tokens`
    : EMPTY_VALUE;
};

export const SettingsAiModelTiersPreview = () => {
  const tiers = useAiModelTiers();
  const hasCostPerTaskForEveryTier = tiers.every(
    (tier) => !isDefined(tier.model) || isDefined(tier.model.costPerTask),
  );

  return (
    <Section>
      <H2Title
        title={t`Preview`}
        description={t`The tiers people and agents choose between`}
      />
      <Table>
        <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
          <TableHeader>{t`Tier`}</TableHeader>
          <TableHeader>{t`Model`}</TableHeader>
          <TableHeader align="right">{t`Speed`}</TableHeader>
          <TableHeader align="right">{t`Intelligence`}</TableHeader>
          <TableHeader align="right">{t`Cost`}</TableHeader>
        </TableRow>
        {tiers.map((tier) => (
          <TableRow key={tier.tier} gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
            <TableCell color={themeCssVariables.font.color.primary}>
              {tier.label}
            </TableCell>
            <TableCell>{tier.model?.label ?? EMPTY_VALUE}</TableCell>
            <TableCell align="right">
              {renderBenchmarkValue(tier, formatSpeed(tier))}
            </TableCell>
            <TableCell align="right">
              {renderBenchmarkValue(tier, formatIntelligence(tier))}
            </TableCell>
            <TableCell align="right">
              {formatCost({ tier, hasCostPerTaskForEveryTier })}
            </TableCell>
          </TableRow>
        ))}
      </Table>
      {tiers.some((tier) => tier.model?.isBenchmarkInherited ?? false) && (
        <AppTooltip
          anchorSelect={`.${INHERITED_BENCHMARK_CLASS_NAME}`}
          title={t`Not measured at this effort yet. Showing the base model's reading.`}
          delay={TooltipDelay.shortDelay}
        />
      )}
    </Section>
  );
};
