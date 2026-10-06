import { FloatingPortal } from '@floating-ui/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isAiModelEffort } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBrain,
  IconChartBar,
  IconCpu,
  IconCurrencyDollar,
  IconGauge,
  IconInfoCircle,
} from 'twenty-ui/icon';
import { Separator } from 'twenty-ui/primitives/layout';
import { MetricRow } from 'twenty-ui/components/data-display';
import { themeCssVariables, useThemeContainer } from 'twenty-ui/theme';

import { useAiChatHoverCard } from '@/ai/hooks/useAiChatHoverCard';
import { type ResolvedAiModelTier } from '@/ai/types/ResolvedAiModelTier';
import { getAiModelEffortLabel } from '@/ai/utils/getAiModelEffortLabel';
import { getAiModelModeDescription } from '@/settings/ai/utils/getAiModelModeDescription';
import { StyledInformationCard } from '@/ui/layout/information-card/components/StyledInformationCard';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledTrigger = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  height: 20px;
  justify-content: center;
  padding: 0;
  width: 20px;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
  }
`;

const StyledHeading = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledNote = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type AiModelTierInformationButtonProps = {
  resolvedTier: ResolvedAiModelTier;
};

export const AiModelTierInformationButton = ({
  resolvedTier,
}: AiModelTierInformationButtonProps) => {
  const { t } = useLingui();

  const themeContainer = useThemeContainer();

  const { isOpen, refs, floatingStyles, getReferenceProps, getFloatingProps } =
    useAiChatHoverCard({ placement: 'top-end', role: 'tooltip' });

  const model = resolvedTier.model;

  const effort = model?.effort;

  const formatComparison = (delta: number | undefined) =>
    isDefined(delta)
      ? `${delta > 0 ? '+' : ''}${formatNumber(delta, { decimals: 1 })}%`
      : t`Not available`;

  const rows = [
    {
      label: t`Model`,
      Icon: IconCpu,
      value: getAiModelModeDescription(resolvedTier, {
        showAutomatic: false,
        showEffort: false,
      }),
    },
    {
      label: t`Effort`,
      Icon: IconBrain,
      value: !isDefined(model)
        ? t`Not available`
        : isDefined(effort) && isAiModelEffort(effort)
          ? getAiModelEffortLabel(effort)
          : t`Default`,
    },
  ];

  const comparisons = [
    {
      label: t`Intelligence`,
      Icon: IconChartBar,
      value: formatComparison(resolvedTier.intelligenceDeltaPercent),
    },
    {
      label: t`Speed`,
      Icon: IconGauge,
      value: formatComparison(resolvedTier.speedDeltaPercent),
    },
    {
      label: t`Cost index`,
      Icon: IconCurrencyDollar,
      value: isDefined(resolvedTier.costDeltaPercent)
        ? `×${formatNumber(1 + resolvedTier.costDeltaPercent / 100, { decimals: 2 })}`
        : t`Not available`,
    },
  ];

  return (
    <>
      <StyledTrigger
        ref={refs.setReference}
        type="button"
        aria-label={t`Model information`}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...getReferenceProps()}
      >
        <IconInfoCircle size={14} />
      </StyledTrigger>
      {isOpen && (
        <FloatingPortal root={themeContainer}>
          <StyledInformationCard
            ref={refs.setFloating}
            style={floatingStyles}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...getFloatingProps()}
          >
            {rows.map(({ label, Icon, value }) => (
              <MetricRow key={label} startIcon={Icon} value={value}>
                {label}
              </MetricRow>
            ))}
            <Separator style={{ margin: 0 }} />
            <StyledHeading>{t`Vs Balanced mode`}</StyledHeading>
            {comparisons.map(({ label, Icon, value }) => (
              <MetricRow key={label} startIcon={Icon} value={value}>
                {label}
              </MetricRow>
            ))}
            {model?.isBenchmarkInherited === true && (
              <StyledNote>{t`Not measured at this effort yet, so these are the base model's readings.`}</StyledNote>
            )}
          </StyledInformationCard>
        </FloatingPortal>
      )}
    </>
  );
};
