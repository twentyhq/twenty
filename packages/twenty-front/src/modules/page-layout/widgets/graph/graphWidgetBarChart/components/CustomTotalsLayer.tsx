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
  groupMode?: 'grouped' | 'stacked';
};

type LabelData = {
  key: string;
  value: number;
  x: number;
  y: number;
};

const computeGroupedLabels = (
  bars: readonly ComputedBarDatum<BarChartDataItem>[],
): LabelData[] => {
  return bars.map((bar) => ({
    key: `value-${bar.data.id}-${bar.data.indexValue}`,
    value: Number(bar.data.value),
    x: bar.x + bar.width / 2,
    y: bar.y,
  }));
};

const computeStackedLabels = (
  bars: readonly ComputedBarDatum<BarChartDataItem>[],
): LabelData[] => {
  const groupTotals = new Map<
    string,
    {
      total: number;
      maxY: number;
      bars: ComputedBarDatum<BarChartDataItem>[];
    }
  >();

  for (const bar of bars) {
    const groupKey = String(bar.data.indexValue);
    const existingGroup = groupTotals.get(groupKey);

    if (isDefined(existingGroup)) {
      existingGroup.total += Number(bar.data.value);
      existingGroup.maxY = Math.min(existingGroup.maxY, bar.y);
      existingGroup.bars.push(bar);
    } else {
      groupTotals.set(groupKey, {
        total: Number(bar.data.value),
        maxY: bar.y,
        bars: [bar],
      });
    }
  }

  return Array.from(groupTotals.entries()).map(
    ([groupKey, { total, maxY, bars: groupBars }]) => {
      const centerX =
        groupBars.reduce((acc, bar) => acc + bar.x + bar.width / 2, 0) /
        groupBars.length;

      return {
        key: `total-${groupKey}`,
        value: total,
        x: centerX,
        y: maxY,
      };
    },
  );
};

export const CustomTotalsLayer = ({
  bars,
  formatValue,
  offset = 0,
  layout = 'vertical',
  groupMode = 'grouped',
}: CustomTotalsLayerProps) => {
  const theme = useTheme();
  const isVertical = layout === 'vertical';

  const labels =
    groupMode === 'stacked'
      ? computeStackedLabels(bars)
      : computeGroupedLabels(bars);

  return (
    <>
      {labels.map((label) => (
        <animated.text
          key={label.key}
          x={label.x}
          y={label.y}
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
          {isDefined(formatValue) ? formatValue(label.value) : label.value}
        </animated.text>
      ))}
    </>
  );
};
