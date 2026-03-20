import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { pageLayoutResizingWidgetIdComponentState } from '@/page-layout/states/pageLayoutResizingWidgetIdComponentState';
import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { BarChart } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/BarChart';
import { BarChartTooltip } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/BarChartTooltip';
import { useBarChartData } from '@/page-layout/widgets/graph/graph-widget-bar-chart/hooks/useBarChartData';
import { graphWidgetBarTooltipComponentState } from '@/page-layout/widgets/graph/graph-widget-bar-chart/states/graphWidgetBarTooltipComponentState';
import { graphWidgetHoveredSliceIndexComponentState } from '@/page-layout/widgets/graph/graph-widget-bar-chart/states/graphWidgetHoveredSliceIndexComponentState';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartDatum';
import { type BarChartSeriesWithColor } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartSeries';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartSlice';
import { type BarChartSliceHoverData } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartSliceHoverData';
import { calculateStackedBarChartValueRange } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/calculateStackedBarChartValueRange';
import { calculateValueRangeFromBarChartKeys } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/calculateValueRangeFromBarChartKeys';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { computeEffectiveValueRange } from '@/page-layout/widgets/graph/utils/computeEffectiveValueRange';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { isSidePanelAnimatingState } from '@/side-panel/states/isSidePanelAnimatingState';
import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { isNumber } from '@sniptt/guards';
import { useContext, useMemo, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { useDebouncedCallback } from 'use-debounce';
import { BarChartLayout } from '~/generated-metadata/graphql';

type GraphWidgetBarChartProps = {
  colorMode: GraphColorMode;
  data: BarChartDatum[];
  groupMode?: 'grouped' | 'stacked';
  id: string;
  indexBy: string;
  keys: string[];
  layout?: BarChartLayout;
  omitNullValues?: boolean;
  onSliceClick?: (slice: BarChartSlice) => void;
  rangeMax?: number;
  rangeMin?: number;
  series?: BarChartSeriesWithColor[];
  seriesLabels?: Record<string, string>;
  showGrid?: boolean;
  showLegend?: boolean;
  showValues?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
} & GraphValueFormatOptions;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

export const GraphWidgetBarChart = ({
  data,
  indexBy,
  keys,
  series,
  showLegend = true,
  showGrid = true,
  showValues = false,
  xAxisLabel,
  yAxisLabel,
  id,
  layout = BarChartLayout.VERTICAL,
  groupMode = 'grouped',
  colorMode,
  seriesLabels,
  rangeMin,
  rangeMax,
  omitNullValues = false,
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
  onSliceClick,
}: GraphWidgetBarChartProps) => {
  const { theme } = useContext(ThemeContext);
  const colorRegistry = createGraphColorRegistry(theme.color);

  const [chartWidth, setChartWidth] = useState<number>(0);
  const [chartHeight, setChartHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const setGraphWidgetBarTooltip = useSetAtomComponentState(
    graphWidgetBarTooltipComponentState,
  );

  const setGraphWidgetHoveredSliceIndex = useSetAtomComponentState(
    graphWidgetHoveredSliceIndexComponentState,
  );

  const graphWidgetHoveredSliceIndex = useAtomComponentStateValue(
    graphWidgetHoveredSliceIndexComponentState,
  );

  const pageLayoutDraggingWidgetId = useAtomComponentStateValue(
    pageLayoutDraggingWidgetIdComponentState,
  );

  const pageLayoutResizingWidgetId = useAtomComponentStateValue(
    pageLayoutResizingWidgetIdComponentState,
  );

  const isSidePanelAnimating = useAtomStateValue(isSidePanelAnimatingState);

  const isLayoutAnimating =
    isSidePanelAnimating ||
    pageLayoutDraggingWidgetId === id ||
    pageLayoutResizingWidgetId === id;

  const allowDataTransitions = !isLayoutAnimating;

  const formatOptions = useMemo<GraphValueFormatOptions>(
    () => ({
      customFormatter,
      decimals,
      displayType,
      prefix,
      suffix,
    }),
    [customFormatter, decimals, displayType, prefix, suffix],
  );

  const { enrichedKeysMap, enrichedKeys, legendItems, visibleKeys } =
    useBarChartData({ keys, series, colorRegistry, seriesLabels, colorMode });

  const orderedKeys =
    groupMode === 'stacked' && layout === BarChartLayout.VERTICAL
      ? visibleKeys.toReversed()
      : visibleKeys;

  const calculatedValueRange =
    groupMode === 'stacked'
      ? calculateStackedBarChartValueRange(data, visibleKeys)
      : calculateValueRangeFromBarChartKeys(data, visibleKeys);

  const hasNoData = data.length === 0 || visibleKeys.length === 0;

  const { effectiveMinimumValue, effectiveMaximumValue } =
    computeEffectiveValueRange({
      calculatedMaximum: calculatedValueRange.maximum,
      calculatedMinimum: calculatedValueRange.minimum,
      rangeMax,
      rangeMin,
    });

  const hasExplicitRangeBounds = isDefined(rangeMin) || isDefined(rangeMax);

  const rightTickLabels = useMemo(() => {
    if (
      !hasExplicitRangeBounds ||
      !showValues ||
      layout !== BarChartLayout.HORIZONTAL
    ) {
      return undefined;
    }
    const labels: string[] = [];
    for (const dataItem of data) {
      for (const visibleKey of visibleKeys) {
        const value = dataItem[visibleKey];

        if (isNumber(value)) {
          labels.push(formatGraphValue(value, formatOptions));
        }
      }
    }
    return labels;
  }, [
    data,
    visibleKeys,
    formatOptions,
    hasExplicitRangeBounds,
    showValues,
    layout,
  ]);

  const dataByIndexValue = useMemo(
    () => new Map(data.map((row) => [String(row[indexBy]), row])),
    [data, indexBy],
  );

  const hasClickableItems = isDefined(onSliceClick);

  const hideTooltip = () => {
    setGraphWidgetBarTooltip(null);
    setGraphWidgetHoveredSliceIndex(null);
  };

  const debouncedHideTooltip = useDebouncedCallback(hideTooltip, 300);

  const handleTooltipMouseEnter = () => {
    debouncedHideTooltip.cancel();
  };

  const handleTooltipMouseLeave = debouncedHideTooltip;

  const handleSliceHover = (sliceData: BarChartSliceHoverData | null) => {
    if (isDefined(sliceData)) {
      debouncedHideTooltip.cancel();
      setGraphWidgetHoveredSliceIndex(sliceData.slice.indexValue);
      setGraphWidgetBarTooltip({
        offsetLeft: sliceData.offsetLeft,
        offsetTop: sliceData.offsetTop,
        slice: sliceData.slice,
      });
    } else {
      debouncedHideTooltip();
    }
  };

  const handleSliceLeave = () => {
    debouncedHideTooltip();
  };

  return (
    <StyledContainer id={id}>
      <GraphWidgetChartContainer
        ref={containerRef}
        $isClickable={hasClickableItems}
        $cursorSelector="canvas"
      >
        <NodeDimensionEffect
          elementRef={containerRef}
          onDimensionChange={({ height, width }) => {
            setChartHeight(height);
            setChartWidth(width);
          }}
        />
        {chartWidth > 0 && chartHeight > 0 && (
          <BarChart
            allowDataTransitions={allowDataTransitions}
            axisConfig={{
              showGrid,
              xAxisLabel,
              yAxisLabel,
            }}
            chartHeight={chartHeight}
            chartWidth={chartWidth}
            data={data}
            dataLabelsConfig={{
              omitNullValues,
              show: showValues,
            }}
            effectiveValueRange={{
              maximum: effectiveMaximumValue,
              minimum: effectiveMinimumValue,
            }}
            hasExplicitRangeBounds={hasExplicitRangeBounds}
            enrichedKeysMap={enrichedKeysMap}
            formatOptions={formatOptions}
            rightTickLabels={rightTickLabels}
            groupMode={groupMode}
            hasNoData={hasNoData}
            hoveredSliceIndexValue={graphWidgetHoveredSliceIndex}
            indexBy={indexBy}
            keys={orderedKeys}
            layout={layout}
            onSliceClick={onSliceClick}
            onSliceHover={handleSliceHover}
            onSliceLeave={handleSliceLeave}
          />
        )}
      </GraphWidgetChartContainer>

      <BarChartTooltip
        containerRef={containerRef}
        dataByIndexValue={dataByIndexValue}
        enrichedKeys={enrichedKeys}
        formatOptions={formatOptions}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
        onSliceClick={onSliceClick}
      />
      <GraphWidgetLegend
        items={legendItems}
        show={showLegend && data.length > 0 && keys.length > 0}
      />
    </StyledContainer>
  );
};
