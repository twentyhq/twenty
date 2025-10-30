import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { useTheme } from '@emotion/react';
import { type BarCustomLayerProps } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';

type CustomTotalsLayerProps = Pick<
  BarCustomLayerProps<BarChartDataItem>,
  'bars'
> & {
  formatValue?: (value: number) => string;
  offset?: number;
};

export const CustomTotalsLayer = ({
  bars,
  formatValue,
  offset = 0,
}: CustomTotalsLayerProps) => {
  const theme = useTheme();

  const groupTotals = new Map<
    string,
    { total: number; maxY: number; centerX: number; bars: typeof bars }
  >();

  for (const bar of bars) {
    const groupKey = String(bar.data.indexValue);
    const existingGroup = groupTotals.get(groupKey);

    if (isDefined(existingGroup)) {
      existingGroup.total += Number(bar.data.value);
      existingGroup.maxY = Math.min(existingGroup.maxY, bar.y);
      existingGroup.bars = [...existingGroup.bars, bar];
      continue;
    }

    groupTotals.set(groupKey, {
      total: Number(bar.data.value),
      maxY: bar.y,
      centerX: bar.x + bar.width / 2,
      bars: [bar],
    });
  }

  return (
    <>
      {Array.from(groupTotals.entries()).map(
        ([groupKey, { total, maxY, bars: groupBars }]) => {
          const minX = Math.min(...groupBars.map((bar) => bar.x));
          const maxX = Math.max(...groupBars.map((bar) => bar.x + bar.width));
          const centerX = (minX + maxX) / 2;

          return (
            <text
              key={`total-${groupKey}`}
              x={centerX}
              y={maxY}
              textAnchor="middle"
              dominantBaseline="auto"
              style={{
                fill: theme.font.color.light,
                fontSize: 11,
                fontWeight: theme.font.weight.medium,
                transform: `translateY(-${offset}px)`,
              }}
            >
              {isDefined(formatValue) ? formatValue(total) : total}
            </text>
          );
        },
      )}
    </>
  );
};
