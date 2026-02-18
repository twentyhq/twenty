import { isSidePanelAnimatingStateV2 } from '@/command-menu/states/isSidePanelAnimatingStateV2';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { pageLayoutResizingWidgetIdComponentState } from '@/page-layout/states/pageLayoutResizingWidgetIdComponentState';
import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { BarChart } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChart';
import { BarChartTooltip } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartTooltip';
import { useBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartData';
import { graphWidgetBarTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetBarTooltipComponentState';
import { graphWidgetHoveredSliceIndexComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetHoveredSliceIndexComponentState';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartSeriesWithColor } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type BarChartSliceHoverData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSliceHoverData';
import { calculateStackedBarChartValueRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateStackedBarChartValueRange';
import { calculateValueRangeFromBarChartKeys } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateValueRangeFromBarChartKeys';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { computeEffectiveValueRange } from '@/page-layout/widgets/graph/utils/computeEffectiveValueRange';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
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
  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme);

  const [chartWidth, setChartWidth] = useState<number>(0);
  const [chartHeight, setChartHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const setActiveBarTooltip = useSetRecoilComponentState(
    graphWidgetBarTooltipComponentState,
  );

  const setHoveredSliceIndex = useSetRecoilComponentState(
    graphWidgetHoveredSliceIndexComponentState,
  );

  const hoveredSliceIndexValue = useRecoilComponentValue(
    graphWidgetHoveredSliceIndexComponentState,
  );

  const draggingWidgetId = useRecoilComponentValue(
    pageLayoutDraggingWidgetIdComponentState,
  );

  const resizingWidgetId = useRecoilComponentValue(
    pageLayoutResizingWidgetIdComponentState,
  );

  const isSidePanelAnimating = useRecoilValueV2(isSidePanelAnimatingStateV2);

  const isLayoutAnimating =
    isSidePanelAnimating || draggingWidgetId === id || resizingWidgetId === id;

  const allowDataTransitions = !isLayoutAnimating;

  const formatOptions: GraphValueFormatOptions = {
    customFormatter,
    decimals,
    displayType,
    prefix,
    suffix,
  };

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

  const dataByIndexValue = useMemo(
    () => new Map(data.map((row) => [String(row[indexBy]), row])),
    [data, indexBy],
  );

  const hasClickableItems = isDefined(onSliceClick);

  const hideTooltip = () => {
    setActiveBarTooltip(null);
    setHoveredSliceIndex(null);
  };

  const debouncedHideTooltip = useDebouncedCallback(hideTooltip, 300);

  const handleTooltipMouseEnter = () => {
    debouncedHideTooltip.cancel();
  };

  const handleTooltipMouseLeave = debouncedHideTooltip;

  const handleSliceHover = (sliceData: BarChartSliceHoverData | null) => {
    if (isDefined(sliceData)) {
      debouncedHideTooltip.cancel();
      setHoveredSliceIndex(sliceData.slice.indexValue);
      setActiveBarTooltip({
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
            enrichedKeysMap={enrichedKeysMap}
            formatOptions={formatOptions}
            groupMode={groupMode}
            hasNoData={hasNoData}
            hoveredSliceIndexValue={hoveredSliceIndexValue}
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
