import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiModelTierIndicator } from '@/ai/components/AiModelTierIndicator';
import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { type ResolvedAiModelTier } from '@/ai/types/ResolvedAiModelTier';
import { getAiModelModeDescription } from '@/settings/ai/utils/getAiModelModeDescription';
import { getModelIcon } from '@/settings/ai/utils/getModelIcon';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { formatNumber } from '~/utils/format/formatNumber';

const GRID_TEMPLATE_COLUMNS = '1fr 1fr 1fr 1fr';
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

const formatCost = (tier: ResolvedAiModelTier) =>
  isDefined(tier.model?.outputCostPerMillionTokens) &&
  tier.model.outputCostPerMillionTokens > 0
    ? t`$${formatNumber(tier.model.outputCostPerMillionTokens, { decimals: 2 })} / 1M`
    : EMPTY_VALUE;

const StyledMode = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

const StyledTable = styled(Table)`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

export const SettingsAiModelTiersPreview = () => {
  const tiers = useAiModelTiers();

  return (
    <Section>
      <H2Title
        title={t`Preview`}
        description={t`The modes people and agents choose between`}
      />
      <StyledTable>
        <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
          <TableHeader>{t`Mode`}</TableHeader>
          <TableHeader align="right">{t`Speed`}</TableHeader>
          <TableHeader align="right">{t`Intelligence`}</TableHeader>
          <TableHeader align="right">{t`Output cost`}</TableHeader>
        </TableRow>
        {tiers.map((tier) => (
          <TableRow key={tier.tier} gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
            <TableCell color={themeCssVariables.font.color.primary}>
              <StyledMode
                data-tooltip-id={`ai-model-mode-${tier.tier}`}
                tabIndex={0}
              >
                <AiModelTierIndicator tier={tier.tier} />
                {tier.label}
              </StyledMode>
              <AppTooltip
                anchorSelect={`[data-tooltip-id="ai-model-mode-${tier.tier}"]`}
                Icon={
                  isDefined(tier.model)
                    ? getModelIcon(
                        tier.model.modelFamily,
                        tier.model.providerName,
                      )
                    : undefined
                }
                title={getAiModelModeDescription(tier, {
                  showAutomatic: false,
                })}
                description={
                  !isDefined(tier.model)
                    ? t`No model is available for this mode.`
                    : tier.isPinned
                      ? t`Manually selected for this mode.`
                      : t`Automatically selected by Twenty for this mode.`
                }
                delay={TooltipDelay.shortDelay}
              />
            </TableCell>
            <TableCell align="right">
              {renderBenchmarkValue(tier, formatSpeed(tier))}
            </TableCell>
            <TableCell align="right">
              {renderBenchmarkValue(tier, formatIntelligence(tier))}
            </TableCell>
            <TableCell align="right">{formatCost(tier)}</TableCell>
          </TableRow>
        ))}
      </StyledTable>
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
