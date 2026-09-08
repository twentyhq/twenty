import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const getProgressPercentage = (value: number, maximumValue: number): number => {
  if (value <= 0 || maximumValue <= 0) {
    return 0;
  }

  return Math.min(value / maximumValue, 1) * 100;
};

type SettingsAiModelComparisonBarProps = {
  ariaLabel: string;
  color?: string;
  maximumValue: number;
  value: number;
};

export const SettingsAiModelComparisonBar = ({
  ariaLabel,
  color = themeCssVariables.color.green9,
  maximumValue,
  value,
}: SettingsAiModelComparisonBarProps) => {
  const progressPercentage = getProgressPercentage(value, maximumValue);
  const radius = 6;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progressPercentage / 100);

  return (
    <StyledContainer aria-label={ariaLabel} role="img">
      <svg height="14" viewBox="0 0 14 14" width="14">
        <circle
          cx="7"
          cy="7"
          fill="none"
          r={radius}
          stroke={themeCssVariables.background.tertiary}
          strokeWidth="2"
        />
        <circle
          cx="7"
          cy="7"
          fill="none"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth="2"
          transform="rotate(-90 7 7)"
        />
      </svg>
    </StyledContainer>
  );
};
