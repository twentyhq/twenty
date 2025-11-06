import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { CustomBarItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/CustomBarItem';
import { CustomTotalsLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/CustomTotalsLayer';
import { GraphWidgetBarChartTooltip } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphWidgetBarChartTooltip';
import { BAR_CHART_MINIMUM_INNER_PADDING } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMinimumInnerPadding';
import { useBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartData';
import { useBarChartHandlers } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartHandlers';
import { useBarChartTheme } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTheme';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { calculateBarChartValueRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateBarChartValueRange';
import { calculateStackedBarChartValueRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateStackedBarChartValueRange';
import { getBarChartAxisConfigs } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartAxisConfigs';
import { getBarChartColor } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartColor';
import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimatePresence } from 'framer-motion';
import {
  type ComputedBarDatum,
  type ComputedDatum,
  ResponsiveBar,
} from '@nivo/bar';
import { useCallback, useMemo, useRef, useState, type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

const LEGEND_THRESHOLD = 10;

type GraphWidgetBarChartProps = {
  data: BarChartDataItem[];
  indexBy: string;
  keys: string[];
  series?: BarChartSeries[];
  showLegend?: boolean;
  showGrid?: boolean;
  showValues?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  id: string;
  layout?: 'vertical' | 'horizontal';
  groupMode?: 'grouped' | 'stacked';
  seriesLabels?: Record<string, string>;
  rangeMin?: number;
  rangeMax?: number;
  omitNullValues?: boolean;
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
  layout = 'vertical',
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
}: GraphWidgetBarChartProps) => {
  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme);

  // Chart dimensions
  const [chartWidth, setChartWidth] = useState<number>(0);
  const [chartHeight, setChartHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredBar, setHoveredBar] = useState<{
    datum: ComputedDatum<BarChartDataItem>;
    element: SVGRectElement;
  } | null>(null);

  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };

  const { handleBarClick, hasClickableItems } = useBarChartHandlers({
    data,
    indexBy,
  });

  const clearHoveredBar = useCallback(() => {
    setHoveredBar(null);
  }, []);

  const debouncedClearHoveredBar = useDebouncedCallback(clearHoveredBar, 300);

  const handleBarEnter = useCallback(
    (
      datum: ComputedDatum<BarChartDataItem>,
      event: MouseEvent<SVGRectElement>,
    ) => {
      debouncedClearHoveredBar.cancel();
      setHoveredBar({
        datum,
        element: event.currentTarget,
      });
    },
    [debouncedClearHoveredBar],
  );

  const handleBarLeave = useCallback(() => {
    debouncedClearHoveredBar();
  }, [debouncedClearHoveredBar]);

  const chartTheme = useBarChartTheme();

  const { barConfigs, enrichedKeys } = useBarChartData({
    data,
    indexBy,
    keys,
    series,
    colorRegistry,
    seriesLabels,
  });

  const areThereTooManyKeys = keys.length > LEGEND_THRESHOLD;

  const shouldShowLegend = showLegend && !areThereTooManyKeys;

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
    });

  const BarItemWithContext = useMemo(
    () => (props: any) => (
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
    bars: readonly ComputedBarDatum<BarChartDataItem>[];
  }) => (
    <>
      {showValues && (
        <CustomTotalsLayer
          bars={bars}
          formatValue={(value) => formatGraphValue(value, formatOptions)}
          offset={theme.spacingMultiplicator * 2}
          layout={layout}
          groupMode={groupMode}
          omitNullValues={omitNullValues}
        />
      )}
    </>
  );

  const calculatedRange =
    groupMode === 'stacked'
      ? calculateStackedBarChartValueRange(data, keys)
      : calculateBarChartValueRange(data, keys);
  const effectiveMin = rangeMin ?? calculatedRange.min;
  const effectiveMax = rangeMax ?? calculatedRange.max;

  const hasNegativeValues = calculatedRange.min < 0;
  const zeroMarker = hasNegativeValues
    ? [
        {
          axis: (layout === 'vertical' ? 'y' : 'x') as 'y' | 'x',
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
          padding={0.3}
          groupMode={groupMode}
          layout={layout}
          valueScale={{
            type: 'linear',
            min: effectiveMin,
            max: effectiveMax,
            clamp: true,
          }}
          indexScale={{ type: 'band', round: true }}
          colors={(datum) => getBarChartColor(datum, barConfigs, theme)}
          layers={['grid', 'markers', 'axes', 'bars', 'legends', TotalsLayer]}
          markers={zeroMarker}
          axisTop={null}
          axisRight={null}
          axisBottom={axisBottomConfig}
          axisLeft={axisLeftConfig}
          enableGridX={layout === 'horizontal' && showGrid}
          enableGridY={layout === 'vertical' && showGrid}
          gridXValues={layout === 'horizontal' ? 5 : undefined}
          gridYValues={layout === 'vertical' ? 5 : undefined}
          enableLabel={false}
          labelSkipWidth={12}
          innerPadding={
            groupMode !== 'stacked' ? BAR_CHART_MINIMUM_INNER_PADDING : 0
          }
          labelSkipHeight={12}
          valueFormat={(value) =>
            formatGraphValue(Number(value), formatOptions)
          }
          labelTextColor={theme.font.color.primary}
          label={(d) => formatGraphValue(Number(d.value), formatOptions)}
          tooltip={() => null}
          onClick={handleBarClick}
          onMouseEnter={handleBarEnter}
          onMouseLeave={handleBarLeave}
          theme={chartTheme}
          borderRadius={parseInt(theme.border.radius.sm)}
        />
      </GraphWidgetChartContainer>
      <AnimatePresence>
        {isDefined(hoveredBar) && (
          <GraphWidgetBarChartTooltip
            hoveredBarDatum={hoveredBar.datum}
            hoveredBarElement={hoveredBar.element}
            enrichedKeys={enrichedKeys}
            data={data}
            indexBy={indexBy}
            formatOptions={formatOptions}
            enableGroupTooltip={groupMode === 'stacked'}
            onCancelHide={() => debouncedClearHoveredBar.cancel()}
            onRequestHide={() => {
              debouncedClearHoveredBar.cancel();
              clearHoveredBar();
            }}
          />
        )}
      </AnimatePresence>
      <GraphWidgetLegend
        show={shouldShowLegend}
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
