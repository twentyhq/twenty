import { styled } from '@linaria/react';
import { ProgressBar } from 'twenty-ui/feedback';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const MINIMUM_VISIBLE_PROGRESS_PERCENTAGE = 20;
const COMPARISON_BAR_MARKER_PERCENTAGES = [20, 40, 60, 80] as const;

const StyledContainer = styled.div`
  height: ${themeCssVariables.spacing[2]};
  position: relative;
  width: 100%;
`;

const StyledMarker = styled.div<{
  $isActive: boolean;
  $position: number;
}>`
  background: ${({ $isActive }) =>
    $isActive
      ? themeCssVariables.accent.accent5
      : themeCssVariables.grayScale.gray6};
  border-radius: ${themeCssVariables.border.radius.pill};
  height: ${themeCssVariables.spacing[1]};
  left: ${({ $position }) => `${$position}%`};
  pointer-events: none;
  position: absolute;
  top: ${themeCssVariables.spacing[0.5]};
  transform: translateX(-50%);
  width: ${themeCssVariables.spacing[1]};
`;

const getProgressPercentage = (value: number, maximumValue: number): number => {
  if (value <= 0 || maximumValue <= 0) {
    return 0;
  }

  const relativePercentage = Math.min(value / maximumValue, 1);

  return (
    MINIMUM_VISIBLE_PROGRESS_PERCENTAGE +
    relativePercentage * (100 - MINIMUM_VISIBLE_PROGRESS_PERCENTAGE)
  );
};

type SettingsAiModelComparisonBarProps = {
  ariaLabel: string;
  maximumValue: number;
  value: number;
};

export const SettingsAiModelComparisonBar = ({
  ariaLabel,
  maximumValue,
  value,
}: SettingsAiModelComparisonBarProps) => {
  const progressPercentage = getProgressPercentage(value, maximumValue);

  return (
    <StyledContainer>
      <ProgressBar
        value={progressPercentage}
        ariaLabel={ariaLabel}
        barColor={themeCssVariables.accent.accent9}
        backgroundColor={themeCssVariables.background.tertiary}
        withBorderRadius
      />
      {COMPARISON_BAR_MARKER_PERCENTAGES.map((markerPercentage) => (
        <StyledMarker
          key={markerPercentage}
          $position={markerPercentage}
          $isActive={markerPercentage <= progressPercentage}
        />
      ))}
    </StyledContainer>
  );
};
