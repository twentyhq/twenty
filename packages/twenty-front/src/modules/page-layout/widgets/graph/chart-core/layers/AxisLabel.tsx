import { useTheme } from '@emotion/react';

type AxisLabelProps = {
  label: string;
  x: number;
  y: number;
  fontSize: number;
  rotation?: number;
};

export const AxisLabel = ({
  label,
  x,
  y,
  fontSize,
  rotation,
}: AxisLabelProps) => {
  const theme = useTheme();

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      transform={rotation !== undefined ? `rotate(${rotation}, ${x}, ${y})` : undefined}
      fill={theme.font.color.primary}
      fontSize={fontSize}
      fontWeight={theme.font.weight.medium}
    >
      {label}
    </text>
  );
};
