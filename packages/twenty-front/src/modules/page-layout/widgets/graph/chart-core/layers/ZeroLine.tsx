import { useTheme } from '@emotion/react';

type ZeroLineProps = {
  isVertical: boolean;
  zeroPosition: number;
  innerWidth: number;
  innerHeight: number;
};

export const ZeroLine = ({
  isVertical,
  zeroPosition,
  innerWidth,
  innerHeight,
}: ZeroLineProps) => {
  const theme = useTheme();

  return (
    <line
      x1={isVertical ? 0 : zeroPosition}
      y1={isVertical ? zeroPosition : 0}
      x2={isVertical ? innerWidth : zeroPosition}
      y2={isVertical ? zeroPosition : innerHeight}
      stroke={theme.border.color.medium}
      strokeWidth={1}
    />
  );
};
