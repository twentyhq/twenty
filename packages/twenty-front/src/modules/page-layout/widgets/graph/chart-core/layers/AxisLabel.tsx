import { useTheme } from '@emotion/react';
import { isDefined } from 'twenty-shared/utils';

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
      transform={
        isDefined(rotation) ? `rotate(${rotation}, ${x}, ${y})` : undefined
      }
      fill={theme.font.color.primary}
      fontSize={fontSize}
      fontWeight={theme.font.weight.medium}
    >
      {label}
    </text>
  );
};
