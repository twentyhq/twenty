import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type ProgressRingProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
  barColor?: string;
};

const StyledSvg = styled.svg`
  transform: rotate(-90deg);
`;

const StyledTrackCircle = styled.circle`
  fill: none;
  stroke: color-mix(
    in srgb,
    ${themeCssVariables.border.color.strong} 50%,
    ${themeCssVariables.background.quaternary} 50%
  );
`;

const StyledValueCircle = styled.circle`
  fill: none;
  transition: stroke-dashoffset 0.3s ease;
`;

export const ProgressRing = ({
  value,
  size = 16,
  strokeWidth = 2,
  barColor = themeCssVariables.color.blue,
}: ProgressRingProps) => {
  const boundedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <StyledSvg width={size} height={size}>
      <StyledTrackCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      <StyledValueCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        style={{ stroke: barColor }}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (boundedValue / 100) * circumference}
        strokeLinecap="round"
      />
    </StyledSvg>
  );
};
