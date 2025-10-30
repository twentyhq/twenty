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
  verticalX: number;
  verticalY: number;
  horizontalX: number;
  horizontalY: number;
};

const computeGroupedLabels = (
  bars: readonly ComputedBarDatum<BarChartDataItem>[],
): LabelData[] => {
  return bars.map((bar) => {
    const centerX = bar.x + bar.width / 2;
    const centerY = bar.y + bar.height / 2;

    return {
      key: `value-${bar.data.id}-${bar.data.indexValue}`,
      value: Number(bar.data.value),
      verticalX: centerX,
      verticalY: bar.y,
      horizontalX: bar.x + bar.width,
      horizontalY: centerY,
    };
  });
};

const computeStackedLabels = (
  bars: readonly ComputedBarDatum<BarChartDataItem>[],
): LabelData[] => {
  const groupTotals = new Map<
    string,
    {
      total: number;
      maxY: number;
      maxX: number;
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
    } else {
      groupTotals.set(groupKey, {
        total: Number(bar.data.value),
        maxY: bar.y,
        maxX: bar.x + bar.width,
        bars: [bar],
      });
    }
  }

  return Array.from(groupTotals.entries()).map(
    ([groupKey, { total, maxY, maxX, bars: groupBars }]) => {
      const centerX =
        groupBars.reduce((acc, bar) => acc + bar.x + bar.width / 2, 0) /
        groupBars.length;
      const centerY =
        groupBars.reduce((acc, bar) => acc + bar.y + bar.height / 2, 0) /
        groupBars.length;

      return {
        key: `total-${groupKey}`,
        value: total,
        verticalX: centerX,
        verticalY: maxY,
        horizontalX: maxX,
        horizontalY: centerY,
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
          x={isVertical ? label.verticalX : label.horizontalX}
          y={isVertical ? label.verticalY : label.horizontalY}
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
