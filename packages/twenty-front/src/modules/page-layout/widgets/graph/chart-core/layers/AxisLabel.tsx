import { isDefined } from 'twenty-shared/utils';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

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
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      transform={
        isDefined(rotation) ? `rotate(${rotation}, ${x}, ${y})` : undefined
      }
      fill={resolveThemeVariable(themeCssVariables.font.color.primary)}
      fontSize={fontSize}
      fontWeight={resolveThemeVariable(themeCssVariables.font.weight.medium)}
    >
      {label}
    </text>
  );
};
