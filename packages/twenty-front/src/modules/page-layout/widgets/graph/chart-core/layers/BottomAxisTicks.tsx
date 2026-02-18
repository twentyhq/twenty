import { useTheme } from '@emotion/react';

type BottomAxisTicksProps = {
  bottomTickValues: (string | number)[];
  getBottomTickPosition: (value: string | number, index: number) => number;
  formatBottomTick: (value: string | number) => string;
  hasRotation: boolean;
  bottomAxisTickRotation: number;
  tickPadding: number;
  tickFontSize: number;
};

export const BottomAxisTicks = ({
  bottomTickValues,
  getBottomTickPosition,
  formatBottomTick,
  hasRotation,
  bottomAxisTickRotation,
  tickPadding,
  tickFontSize,
}: BottomAxisTicksProps) => {
  const theme = useTheme();

  return (
    <>
      {bottomTickValues.map((value, index) => {
        const x = getBottomTickPosition(value, index);
        const label = formatBottomTick(value);

        return (
          <g key={`bottom-tick-${index}`} transform={`translate(${x}, 0)`}>
            <text
              x={0}
              y={tickPadding + tickFontSize}
              textAnchor={hasRotation ? 'end' : 'middle'}
              transform={
                hasRotation
                  ? `rotate(${bottomAxisTickRotation}, 0, ${tickPadding + tickFontSize / 2})`
                  : undefined
              }
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
