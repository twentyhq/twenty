import { useTheme } from '@emotion/react';

type LeftAxisTicksProps = {
  leftTickValues: (string | number)[];
  getLeftTickPosition: (value: string | number, index: number) => number;
  formatLeftTick: (value: string | number) => string;
  tickPadding: number;
  tickFontSize: number;
};

export const LeftAxisTicks = ({
  leftTickValues,
  getLeftTickPosition,
  formatLeftTick,
  tickPadding,
  tickFontSize,
}: LeftAxisTicksProps) => {
  const theme = useTheme();

  return (
    <>
      {leftTickValues.map((value, index) => {
        const y = getLeftTickPosition(value, index);
        const label = formatLeftTick(value);

        return (
          <g key={`left-tick-${index}`} transform={`translate(0, ${y})`}>
            <text
              x={-tickPadding}
              y={0}
              textAnchor="end"
              dominantBaseline="middle"
              fill={theme.font.color.secondary}
              fontSize={tickFontSize}
            >
              {label}
            </text>
          </g>
        );
      })}
    </>
  );
};
