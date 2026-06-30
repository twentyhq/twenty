import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

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
  const { theme } = useContext(ThemeContext);

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
