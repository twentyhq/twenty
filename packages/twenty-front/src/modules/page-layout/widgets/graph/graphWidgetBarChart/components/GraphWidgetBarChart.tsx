import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { NoDataLayer } from '@/page-layout/widgets/graph/components/NoDataLayer';
import { CustomBarItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/CustomBarItem';
import { CustomTotalsLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/CustomTotalsLayer';
import { GraphBarChartTooltip } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphBarChartTooltip';
import { BAR_CHART_OUTER_PADDING_RATIO } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartOuterPaddingRatio';
import { useBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartData';
import { useBarChartTheme } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTheme';
import { BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { calculateStackedBarChartValueRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateStackedBarChartValueRange';
import { calculateValueRangeFromBarChartKeys } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateValueRangeFromBarChartKeys';
import { getBarChartAxisConfigs } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartAxisConfigs';
import { getBarChartColor } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartColor';
import { getBarChartInnerPadding } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartInnerPadding';
import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';
import { getBarChartTickConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTickConfig';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { computeValueTickValues } from '@/page-layout/widgets/graph/utils/computeValueTickValues';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ResponsiveBar,
  type BarCustomLayerProps,
  type BarDatum,
  type BarItemProps,
  type ComputedBarDatum,
  type ComputedDatum,
} from '@nivo/bar';
import { useCallback, useMemo, useRef, useState, type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

import { graphWidgetBarTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetBarTooltipComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

type NoDataLayerWrapperProps = BarCustomLayerProps<BarDatum>;

type GraphWidgetBarChartProps = {
  data: BarDatum[];
  indexBy: string;
  keys: string[];
  series?: BarChartSeries[];
  showLegend?: boolean;
  showGrid?: boolean;
  showValues?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  id: string;
  layout?: BarChartLayout;
  groupMode?: 'grouped' | 'stacked';
  seriesLabels?: Record<string, string>;
  rangeMin?: number;
  rangeMax?: number;
  omitNullValues?: boolean;
  onBarClick?: (datum: ComputedDatum<BarDatum>) => void;
} & GraphValueFormatOptions;

const POSITIVE_RANGE_PADDING_RATIO = 0.1;
const MIN_POSITIVE_RANGE_PADDING = 1;

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
  seriesLabels,
  rangeMin,
  rangeMax,
  omitNullValues = false,
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
  onBarClick,
}: GraphWidgetBarChartProps) => {
  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme);

  const [chartWidth, setChartWidth] = useState<number>(0);
  const [chartHeight, setChartHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const setActiveBarTooltip = useSetRecoilComponentState(
    graphWidgetBarTooltipComponentState,
  );

  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };

  const chartTheme = useBarChartTheme();

  const { barConfigs, enrichedKeys } = useBarChartData({
    data,
    indexBy,
    keys,
    series,
    colorRegistry,
    seriesLabels,
  });

  const calculatedValueRange =
    groupMode === 'stacked'
      ? calculateStackedBarChartValueRange(data, keys)
      : calculateValueRangeFromBarChartKeys(data, keys);

  const hasOnlyNonNegativeValues =
    calculatedValueRange.minimum >= 0 && calculatedValueRange.maximum >= 0;
  const hasOnlyZeroValues =
    calculatedValueRange.minimum === 0 && calculatedValueRange.maximum === 0;
  const hasNoData = data.length === 0 || hasOnlyZeroValues;

  const baseMinimumValue = isDefined(rangeMin)
    ? rangeMin
    : hasOnlyNonNegativeValues
    ? 0
    : calculatedValueRange.minimum;

  const positiveRangePaddingTarget = isDefined(rangeMax)
    ? rangeMax
    : calculatedValueRange.maximum;

  const paddedMaximumForNonNegative =
    isDefined(rangeMax) || !hasOnlyNonNegativeValues
      ? positiveRangePaddingTarget
      : positiveRangePaddingTarget +
        Math.max(
          Math.abs(positiveRangePaddingTarget) * POSITIVE_RANGE_PADDING_RATIO,
          MIN_POSITIVE_RANGE_PADDING,
        );

  let effectiveMinimumValue = baseMinimumValue;
  let effectiveMaximumValue = paddedMaximumForNonNegative;

  if (!isDefined(rangeMax) && !isDefined(rangeMin)) {
    if (effectiveMinimumValue === effectiveMaximumValue) {
      effectiveMaximumValue =
        effectiveMinimumValue + MIN_POSITIVE_RANGE_PADDING;
    }
  }

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

  const valueTickValues = computeValueTickValues({
    minimum: effectiveMinimumValue,
    maximum: effectiveMaximumValue,
    tickCount: tickConfig.numberOfValueTicks,
  });

  const hasClickableItems = isDefined(onBarClick);

  const hideTooltip = () => setActiveBarTooltip(null);
  const debouncedHideTooltip = useDebouncedCallback(hideTooltip, 300);

  const handleTooltipMouseEnter = () => {
    debouncedHideTooltip.cancel();
  };

  const handleTooltipMouseLeave = debouncedHideTooltip;

  const handleBarEnter = useCallback(
    (datum: ComputedDatum<BarDatum>, event: MouseEvent<SVGRectElement>) => {
      debouncedHideTooltip.cancel();
      setActiveBarTooltip({
        datum,
        anchorElement: event.currentTarget,
      });
    },
    [debouncedHideTooltip, setActiveBarTooltip],
  );

  const handleBarLeave = useCallback(() => {
    debouncedHideTooltip();
  }, [debouncedHideTooltip]);

  const { axisBottom: axisBottomConfig, axisLeft: axisLeftConfig } =
    getBarChartAxisConfigs({
      width: chartWidth,
      height: chartHeight,
      data,
      layout,
      indexBy,
      xAxisLabel,
      yAxisLabel,
      formatOptions,
      axisFontSize: chartTheme.axis.ticks.text.fontSize,
      valueTickValues,
      tickConfig,
    });

  const BarItemWithContext = useMemo(
    () => (props: BarItemProps<BarDatum>) => (
      <CustomBarItem
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        keys={keys}
        groupMode={groupMode}
        data={data}
        indexBy={indexBy}
        layout={layout}
        chartId={id}
      />
    ),
    [keys, groupMode, data, indexBy, layout, id],
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

  const margins = getBarChartMargins({ xAxisLabel, yAxisLabel, layout });

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
            setChartWidth(width);
            setChartHeight(height);
          }}
        />
        <ResponsiveBar
          barComponent={BarItemWithContext}
          data={data}
          keys={keys}
          indexBy={indexBy}
          margin={margins}
          padding={BAR_CHART_OUTER_PADDING_RATIO}
          groupMode={groupMode}
          layout={layout}
          valueScale={{
            type: 'linear',
            min: effectiveMinimumValue,
            max: effectiveMaximumValue,
            clamp: true,
          }}
          indexScale={{ type: 'band', round: true }}
          colors={(datum) => getBarChartColor(datum, barConfigs, theme)}
          layers={[
            'grid',
            'markers',
            'axes',
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
          gridXValues={layout === BarChartLayout.HORIZONTAL ? 5 : undefined}
          gridYValues={layout === BarChartLayout.VERTICAL ? 5 : undefined}
          enableLabel={false}
          labelSkipWidth={12}
          innerPadding={getBarChartInnerPadding({
            chartWidth,
            chartHeight,
            dataLength: data.length,
            keysLength: keys.length,
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
          onMouseEnter={hasNoData ? undefined : handleBarEnter}
          onMouseLeave={hasNoData ? undefined : handleBarLeave}
          onClick={hasNoData ? undefined : onBarClick}
          theme={chartTheme}
          borderRadius={parseInt(theme.border.radius.sm)}
        />
      </GraphWidgetChartContainer>

      <GraphBarChartTooltip
        containerRef={containerRef}
        enrichedKeys={enrichedKeys}
        formatOptions={formatOptions}
        enableGroupTooltip={groupMode === 'stacked'}
        layout={layout}
        onBarClick={onBarClick}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
      />
      <GraphWidgetLegend
        show={showLegend && !hasNoData}
        items={enrichedKeys.map((item) => {
          return {
            id: item.key,
            label: item.label,
            color: item.colorScheme.solid,
          };
        })}
      />
    </StyledContainer>
  );
};
