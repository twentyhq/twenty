import { GraphDataLabel } from '@/page-layout/widgets/graph/components/GraphDataLabel';
import { type GraphLabelData } from '@/page-layout/widgets/graph/types/GraphLabelData';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
import { type BarCustomLayerProps, type ComputedBarDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';

type CustomTotalsLayerProps = Pick<
  BarCustomLayerProps<BarChartDataItem>,
  'bars'
> & {
  formatValue?: (value: number) => string;
  offset?: number;
  layout?: BarChartLayout;
  groupMode?: 'grouped' | 'stacked';
  omitNullValues?: boolean;
};

type BarChartLabelData = {
  key: string;
  value: number;
  verticalX: number;
  verticalY: number;
  horizontalX: number;
  horizontalY: number;
  shouldRenderBelow: boolean;
};

const computeGroupedLabels = (
  bars: readonly ComputedBarDatum<BarChartDataItem>[],
): BarChartLabelData[] => {
  return bars.map((bar) => {
    const value = Number(bar.data.value);
    const shouldRenderBelow = value < 0;
    const centerX = bar.x + bar.width / 2;
    const centerY = bar.y + bar.height / 2;

    return {
      key: `value-${bar.data.id}-${bar.data.indexValue}`,
      value,
      verticalX: centerX,
      verticalY: shouldRenderBelow ? bar.y + bar.height : bar.y,
      horizontalX: shouldRenderBelow ? bar.x : bar.x + bar.width,
      horizontalY: centerY,
      shouldRenderBelow,
    };
  });
};

const computeStackedLabels = (
  bars: readonly ComputedBarDatum<BarChartDataItem>[],
): BarChartLabelData[] => {
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
        shouldRenderBelow: false,
      };
    },
  );
};

const convertToGraphLabelData = (
  barChartLabel: BarChartLabelData,
  isVerticalLayout: boolean,
): GraphLabelData => {
  return {
    key: barChartLabel.key,
    value: barChartLabel.value,
    x: isVerticalLayout ? barChartLabel.verticalX : barChartLabel.horizontalX,
    y: isVerticalLayout ? barChartLabel.verticalY : barChartLabel.horizontalY,
    shouldRenderBelow: barChartLabel.shouldRenderBelow,
  };
};

export const CustomTotalsLayer = ({
  bars,
  formatValue,
  offset = 0,
  layout = BarChartLayout.VERTICAL,
  groupMode = 'grouped',
  omitNullValues = false,
}: CustomTotalsLayerProps) => {
  const isVerticalLayout = layout === BarChartLayout.VERTICAL;

  const barChartLabels =
    groupMode === 'stacked'
      ? computeStackedLabels(bars)
      : computeGroupedLabels(bars);

  const labelsToRender = barChartLabels.filter((label) =>
    omitNullValues ? label.value !== 0 : true,
  );

  return (
    <>
      {labelsToRender.map((barChartLabel) => {
        const graphLabel = convertToGraphLabelData(
          barChartLabel,
          isVerticalLayout,
        );

        return (
          <GraphDataLabel
            key={graphLabel.key}
            label={graphLabel}
            formatValue={formatValue}
            offset={offset}
            isVerticalLayout={isVerticalLayout}
          />
        );
      })}
    </>
  );
};
