import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { NoDataLayer } from '@/page-layout/widgets/graph/components/NoDataLayer';
import { CustomBarItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/CustomBarItem';
import { CustomSliceHoverLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/CustomSliceHoverLayer';
import { CustomTotalsLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/CustomTotalsLayer';
import { GraphBarChartTooltip } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphBarChartTooltip';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { useBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartData';
import { useBarChartTheme } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTheme';
import { graphWidgetBarTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetBarTooltipComponentState';
import { graphWidgetHoveredSliceIndexComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetHoveredSliceIndexComponentState';
import { type BarChartSeriesWithColor } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { calculateStackedBarChartValueRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateStackedBarChartValueRange';
import { calculateValueRangeFromBarChartKeys } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateValueRangeFromBarChartKeys';
import { getBarChartAxisConfigs } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartAxisConfigs';
import { getBarChartColor } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartColor';
import { getBarChartInnerPadding } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartInnerPadding';
import { getBarChartTickConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTickConfig';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { computeEffectiveValueRange } from '@/page-layout/widgets/graph/utils/computeEffectiveValueRange';
import { computeValueTickValues } from '@/page-layout/widgets/graph/utils/computeValueTickValues';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ResponsiveBar,
  type BarCustomLayerProps,
  type BarDatum,
  type BarItemProps,
  type ComputedBarDatum,
} from '@nivo/bar';
import { useMemo, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { BarChartLayout } from '~/generated/graphql';

type NoDataLayerWrapperProps = BarCustomLayerProps<BarDatum>;
type SliceHoverLayerWrapperProps = BarCustomLayerProps<BarDatum>;

type GraphWidgetBarChartProps = {
  data: BarDatum[];
  indexBy: string;
  keys: string[];
  series?: BarChartSeriesWithColor[];
  showLegend?: boolean;
  showGrid?: boolean;
  showValues?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  id: string;
  layout?: BarChartLayout;
  groupMode?: 'grouped' | 'stacked';
  colorMode: GraphColorMode;
  seriesLabels?: Record<string, string>;
  rangeMin?: number;
  rangeMax?: number;
  omitNullValues?: boolean;
  onSliceClick?: (slice: BarChartSlice) => void;
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
  groupMode,
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

  const debouncedSetChartDimensions = useDebouncedCallback(
    (width: number, height: number) => {
      setChartWidth(width);
      setChartHeight(height);
    },

    300,
  );

  const setActiveBarTooltip = useSetRecoilComponentState(
    graphWidgetBarTooltipComponentState,
  );

  const setHoveredSliceIndex = useSetRecoilComponentState(
    graphWidgetHoveredSliceIndexComponentState,
  );

  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };

  const chartTheme = useBarChartTheme();

  const { barConfigs, enrichedKeys, legendItems, visibleKeys } =
    useBarChartData({
      data,
      indexBy,
      keys,
      series,
      colorRegistry,
      seriesLabels,
      colorMode,
    });

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
      calculatedMinimum: calculatedValueRange.minimum,
      calculatedMaximum: calculatedValueRange.maximum,
      rangeMin,
      rangeMax,
    });

  const tickConfig = getBarChartTickConfig({
    width: chartWidth,
    height: chartHeight,
    data,
    indexBy,
    xAxisLabel,
    yAxisLabel,
    axisFontSize: chartTheme.axis.ticks.text.fontSize,
    layout,
  });

  const { tickValues: valueTickValues, domain: valueDomain } =
    computeValueTickValues({
      minimum: effectiveMinimumValue,
      maximum: effectiveMaximumValue,
      tickCount: tickConfig.numberOfValueTicks,
    });

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

  const handleSliceHover = (
    sliceData: {
      slice: BarChartSlice;
      offsetLeft: number;
      offsetTop: number;
    } | null,
  ) => {
    if (isDefined(sliceData)) {
      debouncedHideTooltip.cancel();
      setHoveredSliceIndex(sliceData.slice.indexValue);
      setActiveBarTooltip({
        slice: sliceData.slice,
        offsetLeft: sliceData.offsetLeft,
        offsetTop: sliceData.offsetTop,
      });
    } else {
      debouncedHideTooltip();
    }
  };

  const handleSliceLeave = () => {
    debouncedHideTooltip();
  };

  const {
    axisBottom: axisBottomConfig,
    axisLeft: axisLeftConfig,
    margins,
  } = getBarChartAxisConfigs({
    layout,
    xAxisLabel,
    yAxisLabel,
    formatOptions,
    valueTickValues,
    tickConfig,
  });

  const BarItemWithContext = useMemo(
    () => (props: BarItemProps<BarDatum>) => (
      <CustomBarItem
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        keys={orderedKeys}
        groupMode={groupMode}
        data={data}
        indexBy={indexBy}
        layout={layout}
        chartId={id}
      />
    ),
    [orderedKeys, groupMode, data, indexBy, layout, id],
  );

  const TotalsLayer = ({
    bars,
  }: {
    bars: readonly ComputedBarDatum<BarDatum>[];
  }) => {
    if (hasNoData) {
      return null;
    }

    return (
      <CustomTotalsLayer
        bars={bars}
        formatValue={(value) => formatGraphValue(value, formatOptions)}
        offset={theme.spacingMultiplicator * 2}
        layout={layout}
        groupMode={groupMode}
        omitNullValues={omitNullValues}
        showValues={showValues}
      />
    );
  };

  const NoDataLayerWrapper = (layerProps: NoDataLayerWrapperProps) => (
    <NoDataLayer
      innerWidth={layerProps.innerWidth}
      innerHeight={layerProps.innerHeight}
      hasNoData={hasNoData}
    />
  );

  const SliceHoverLayerWrapper = (layerProps: SliceHoverLayerWrapperProps) =>
    hasNoData ? null : (
      <CustomSliceHoverLayer
        bars={layerProps.bars}
        innerWidth={layerProps.innerWidth}
        innerHeight={layerProps.innerHeight}
        marginLeft={margins.left}
        marginTop={margins.top}
        layout={layout}
        onSliceHover={handleSliceHover}
        onSliceClick={onSliceClick}
        onSliceLeave={handleSliceLeave}
      />
    );

  const hasNegativeValues = calculatedValueRange.minimum < 0;
  const zeroMarker = hasNegativeValues
    ? [
        {
          axis: (layout === BarChartLayout.VERTICAL ? 'y' : 'x') as 'y' | 'x',
          value: 0,
          lineStyle: {
            stroke: theme.border.color.medium,
            strokeWidth: 1,
          },
        },
      ]
    : undefined;

  return (
    <StyledContainer id={id}>
      <GraphWidgetChartContainer
        ref={containerRef}
        $isClickable={hasClickableItems}
        $cursorSelector="svg g[transform] rect[fill]"
      >
        <NodeDimensionEffect
          elementRef={containerRef}
          onDimensionChange={({ width, height }) => {
            debouncedSetChartDimensions(width, height);
          }}
        />
        <ResponsiveBar
          barComponent={BarItemWithContext}
          data={data}
          keys={orderedKeys}
          indexBy={indexBy}
          margin={margins}
          padding={BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO}
          groupMode={groupMode}
          layout={
            layout === BarChartLayout.VERTICAL ? 'vertical' : 'horizontal'
          }
          valueScale={{
            type: 'linear',
            min: valueDomain.min,
            max: valueDomain.max,
            clamp: true,
          }}
          indexScale={{ type: 'band', round: true }}
          colors={(datum) => getBarChartColor(datum, barConfigs, theme)}
          layers={[
            'grid',
            'markers',
            'axes',
            SliceHoverLayerWrapper,
            'bars',
            'legends',
            TotalsLayer,
            NoDataLayerWrapper,
          ]}
          markers={zeroMarker}
          axisTop={null}
          axisRight={null}
          axisBottom={axisBottomConfig}
          axisLeft={axisLeftConfig}
          enableGridX={layout === BarChartLayout.HORIZONTAL && showGrid}
          enableGridY={layout === BarChartLayout.VERTICAL && showGrid}
          gridXValues={
            layout === BarChartLayout.HORIZONTAL ? valueTickValues : undefined
          }
          gridYValues={
            layout === BarChartLayout.VERTICAL ? valueTickValues : undefined
          }
          enableLabel={false}
          labelSkipWidth={12}
          innerPadding={getBarChartInnerPadding({
            chartWidth,
            chartHeight,
            dataLength: data.length,
            keysLength: visibleKeys.length,
            layout,
            margins,
            groupMode,
          })}
          labelSkipHeight={12}
          valueFormat={(value) =>
            formatGraphValue(Number(value), formatOptions)
          }
          labelTextColor={theme.font.color.primary}
          label={(barDatumCandidate) =>
            formatGraphValue(Number(barDatumCandidate.value), formatOptions)
          }
          tooltip={() => null}
          theme={chartTheme}
          borderRadius={parseInt(theme.border.radius.sm)}
        />
      </GraphWidgetChartContainer>

      <GraphBarChartTooltip
        containerRef={containerRef}
        enrichedKeys={enrichedKeys}
        formatOptions={formatOptions}
        onSliceClick={onSliceClick}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
      />
      <GraphWidgetLegend
        show={showLegend && data.length > 0 && keys.length > 0}
        items={legendItems}
      />
    </StyledContainer>
  );
};
