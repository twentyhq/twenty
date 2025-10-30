import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { useTheme } from '@emotion/react';
import { type BarCustomLayerProps, type ComputedBarDatum } from '@nivo/bar';
import { animated } from '@react-spring/web';
import { isDefined } from 'twenty-shared/utils';

type CustomTotalsLayerProps = Pick<
  BarCustomLayerProps<BarChartDataItem>,
  'bars'
> & {
  formatValue?: (value: number) => string;
  offset?: number;
  layout?: 'vertical' | 'horizontal';
};

export const CustomTotalsLayer = ({
  bars,
  formatValue,
  offset = 0,
  layout = 'vertical',
}: CustomTotalsLayerProps) => {
  const theme = useTheme();

  const isVertical = layout === 'vertical';

  const groupTotals = new Map<
    string,
    {
      total: number;
      maxY: number;
      centerX: number;
      maxX: number;
      centerY: number;
      bars: ComputedBarDatum<BarChartDataItem>[];
    }
  >();

  for (const bar of bars) {
    const groupKey = String(bar.data.indexValue);
    const existingGroup = groupTotals.get(groupKey);

    if (isDefined(existingGroup)) {
      existingGroup.total += Number(bar.data.value);
      existingGroup.maxY = Math.min(existingGroup.maxY, bar.y);
      existingGroup.maxX = Math.max(existingGroup.maxX, bar.x + bar.width);
      existingGroup.bars.push(bar);
      continue;
    }

    groupTotals.set(groupKey, {
      total: Number(bar.data.value),
      maxY: bar.y,
      centerX: bar.x + bar.width / 2,
      maxX: bar.x + bar.width,
      centerY: bar.y + bar.height / 2,
      bars: [bar],
    });
  }

  return (
    <>
      {Array.from(groupTotals.entries()).map(
        ([groupKey, { total, maxY, maxX, bars: groupBars }]) => {
          const centerX =
            groupBars.reduce((acc, bar) => acc + bar.x + bar.width / 2, 0) /
            groupBars.length;
          const centerY =
            groupBars.reduce((acc, bar) => acc + bar.y + bar.height / 2, 0) /
            groupBars.length;

          return (
            <animated.text
              key={`total-${groupKey}`}
              x={isVertical ? centerX : maxX}
              y={isVertical ? maxY : centerY}
              textAnchor={isVertical ? 'middle' : 'start'}
              dominantBaseline={isVertical ? 'auto' : 'central'}
              style={{
                fill: theme.font.color.light,
                fontSize: 11,
                fontWeight: theme.font.weight.medium,
                transform: isVertical
                  ? `translateY(-${offset}px)`
                  : `translateX(${offset}px)`,
              }}
            >
              {isDefined(formatValue) ? formatValue(total) : total}
            </animated.text>
          );
        },
      )}
    </>
  );
};
