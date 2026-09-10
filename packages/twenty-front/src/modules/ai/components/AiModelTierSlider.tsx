import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useContext, useId } from 'react';
import { AI_MODEL_TIERS, type AiModelTier } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconBolt, IconBrain } from 'twenty-ui/icon';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { formatPercentDelta } from '@/ai/utils/formatPercentDelta';
import { formatNumber } from '~/utils/format/formatNumber';

const TRACK_HEIGHT_PX = 24;
const TRACK_INSET_PX = 2;
const DOT_CENTER_INSET_PX = 18;
const HANDLE_WIDTH_PX = 12;
const HANDLE_HEIGHT_PX = 28;
const LAST_STEP = AI_MODEL_TIERS.length - 1;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  justify-content: space-between;
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledMetrics = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledMetric = styled.span<{ isInherited: boolean }>`
  align-items: center;
  color: ${({ isInherited }) =>
    isInherited
      ? themeCssVariables.font.color.light
      : themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 2px;
`;

const StyledTrack = styled.div<{ disabled: boolean }>`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.md};
  corner-shape: round;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  height: ${TRACK_HEIGHT_PX}px;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  position: relative;
  width: 100%;

  &:has(input:focus-visible) {
    box-shadow: 0 0 0 3px ${themeCssVariables.color.blue3};
  }
`;

// The handle centre sits on a dot, so the fill runs from the track inset to
// half a handle past that dot.
const StyledFill = styled.div`
  background: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  corner-shape: round;
  height: ${TRACK_HEIGHT_PX - 2 * TRACK_INSET_PX}px;
  left: ${TRACK_INSET_PX}px;
  position: absolute;
  top: ${TRACK_INSET_PX}px;
  width: calc(
    ${DOT_CENTER_INSET_PX - TRACK_INSET_PX + HANDLE_WIDTH_PX / 2}px +
      var(--slider-step) * (100% - ${2 * DOT_CENTER_INSET_PX}px) / ${LAST_STEP}
  );
`;

const StyledDots = styled.div`
  display: flex;
  inset: 0 ${DOT_CENTER_INSET_PX - 2}px;
  justify-content: space-between;
  pointer-events: none;
  position: absolute;
`;

const StyledDot = styled.span<{ isReached: boolean }>`
  align-self: center;
  background: ${({ isReached }) =>
    isReached
      ? themeCssVariables.background.primary
      : themeCssVariables.border.color.strong};
  border-radius: ${themeCssVariables.border.radius.rounded};
  corner-shape: round;
  height: 4px;
  width: 4px;
`;

const StyledHandle = styled.div`
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  corner-shape: round;
  height: ${HANDLE_HEIGHT_PX}px;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: ${HANDLE_WIDTH_PX}px;
`;

const StyledInput = styled.input`
  appearance: none;
  background: transparent;
  cursor: inherit;
  height: 100%;
  inset: 0;
  margin: 0;
  opacity: 0;
  position: absolute;
  width: 100%;
`;

type AiModelTierSliderProps = {
  selectedTier: AiModelTier;
  onTierChange: (tier: AiModelTier) => void;
  // Shown instead of the tier name, for an agent pinned to a specific model.
  title?: string;
  disabled?: boolean;
};

export const AiModelTierSlider = ({
  selectedTier,
  onTierChange,
  title,
  disabled = false,
}: AiModelTierSliderProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const tiers = useAiModelTiers();
  const tooltipId = useId().replace(/:/g, '');

  const selectedStep = AI_MODEL_TIERS.indexOf(selectedTier);
  const resolvedTier = tiers[selectedStep];
  const model = resolvedTier.model;

  const speedAnchorId = `ai-model-tier-speed-${tooltipId}`;
  const intelligenceAnchorId = `ai-model-tier-intelligence-${tooltipId}`;
  // The base model's reading stands in until the sync measures this effort.
  const isBenchmarkInherited = model?.isBenchmarkInherited === true;
  const inheritedNote = isBenchmarkInherited
    ? t` Not measured at this effort yet, so this is the base model's reading.`
    : '';

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const tier = AI_MODEL_TIERS[Number(event.target.value)];

    if (isDefined(tier)) {
      onTierChange(tier);
    }
  };

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledTitle title={model?.label}>
          {title ?? resolvedTier.label}
        </StyledTitle>
        <StyledMetrics>
          {isDefined(resolvedTier.speedDeltaPercent) && (
            <StyledMetric id={speedAnchorId} isInherited={isBenchmarkInherited}>
              <IconBolt size={theme.icon.size.md} />
              {formatPercentDelta(resolvedTier.speedDeltaPercent)}
            </StyledMetric>
          )}
          {isDefined(resolvedTier.intelligenceDeltaPercent) && (
            <StyledMetric
              id={intelligenceAnchorId}
              isInherited={isBenchmarkInherited}
            >
              <IconBrain size={theme.icon.size.md} />
              {formatPercentDelta(resolvedTier.intelligenceDeltaPercent)}
            </StyledMetric>
          )}
        </StyledMetrics>
      </StyledHeader>
      <StyledTrack
        disabled={disabled}
        style={{ '--slider-step': selectedStep } as React.CSSProperties}
      >
        <StyledFill>
          <StyledHandle />
        </StyledFill>
        <StyledDots>
          {AI_MODEL_TIERS.map((tier, index) => (
            <StyledDot key={tier} isReached={index <= selectedStep} />
          ))}
        </StyledDots>
        <StyledInput
          type="range"
          min={0}
          max={LAST_STEP}
          step={1}
          value={selectedStep}
          onChange={handleChange}
          disabled={disabled}
          aria-label={t`Model`}
          aria-valuetext={resolvedTier.label}
        />
      </StyledTrack>
      {isDefined(model) && (
        <>
          <AppTooltip
            anchorSelect={`#${speedAnchorId}`}
            title={`${t`${model.label}: ${formatNumber(model.outputTokensPerSecond ?? 0)} tokens per second, compared with the Balanced tier.`}${inheritedNote}`}
            delay={TooltipDelay.shortDelay}
            place="bottom"
          />
          <AppTooltip
            anchorSelect={`#${intelligenceAnchorId}`}
            title={`${t`${model.label}: intelligence index ${formatNumber(model.intelligenceIndex ?? 0)}, compared with the Balanced tier.`}${inheritedNote}`}
            delay={TooltipDelay.shortDelay}
            place="bottom"
          />
        </>
      )}
    </StyledContainer>
  );
};
