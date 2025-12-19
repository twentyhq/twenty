import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

type ContextUsageProgressRingProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
};

const StyledSvg = styled.svg`
  transform: rotate(-90deg);
`;

const StyledBackgroundCircle = styled.circle`
  fill: none;
  stroke: ${({ theme }) => theme.background.quaternary};
`;

const StyledProgressCircle = styled.circle`
  fill: none;
  transition: stroke-dashoffset 0.3s ease;
`;

export const ContextUsageProgressRing = ({
  percentage,
  size = 16,
  strokeWidth = 2,
}: ContextUsageProgressRingProps) => {
  const theme = useTheme();

  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (normalizedPercentage / 100) * circumference;

  const progressColor =
    normalizedPercentage > 80
      ? theme.color.red
      : normalizedPercentage > 60
        ? theme.color.orange
        : theme.color.blue;

  return (
    <StyledSvg width={size} height={size}>
      <StyledBackgroundCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      <StyledProgressCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        stroke={progressColor}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </StyledSvg>
  );
};
