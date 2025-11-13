import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { CustomBarItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/CustomBarItem';
import { CustomTotalsLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/CustomTotalsLayer';
import { GraphBarChartTooltip } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/GraphBarChartTooltip';
import { BAR_CHART_MINIMUM_INNER_PADDING } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMinimumInnerPadding';
import { useBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartData';
import { useBarChartTheme } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTheme';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
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
import {
  ResponsiveBar,
  type BarItemProps,
  type ComputedBarDatum,
  type ComputedDatum,
} from '@nivo/bar';
import { useCallback, useMemo, useRef, useState, type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

import { BAR_CHART_LEGEND_ITEM_THRESHOLD } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartLegendItemThreshold';

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
  layout?: BarChartLayout;
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
}: GraphWidgetBarChartProps) => {
  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme);

  // Chart dimensions
  const [chartWidth, setChartWidth] = useState<number>(0);
  const [chartHeight, setChartHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeBarTooltip, setActiveBarTooltip] = useState<{
    datum: ComputedDatum<BarChartDataItem>;
    anchorElement: Element;
  } | null>(null);

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

  const hasClickableItems = data.some((item) => isDefined(item.to));

  const hideTooltip = useCallback(() => setActiveBarTooltip(null), []);
  const debouncedHideTooltip = useDebouncedCallback(hideTooltip, 300);

  const handleTooltipMouseEnter = () => {
    debouncedHideTooltip.cancel();
  };

  const handleTooltipMouseLeave = debouncedHideTooltip;

  const handleBarEnter = useCallback(
    (
      datum: ComputedDatum<BarChartDataItem>,
      event: MouseEvent<SVGRectElement>,
    ) => {
      debouncedHideTooltip.cancel();
      setActiveBarTooltip({
        datum,
        anchorElement: event.currentTarget,
      });
    },
    [debouncedHideTooltip],
  );

  const handleBarLeave = useCallback(() => {
    debouncedHideTooltip();
  }, [debouncedHideTooltip]);

  const areThereTooManyKeys = keys.length > BAR_CHART_LEGEND_ITEM_THRESHOLD;

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
    () => (props: BarItemProps<BarChartDataItem>) => (
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

  const shouldShowBarChartTooltip = isDefined(activeBarTooltip);

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
          enableGridX={layout === BarChartLayout.HORIZONTAL && showGrid}
          enableGridY={layout === BarChartLayout.VERTICAL && showGrid}
          gridXValues={layout === BarChartLayout.HORIZONTAL ? 5 : undefined}
          gridYValues={layout === BarChartLayout.VERTICAL ? 5 : undefined}
          enableLabel={false}
          labelSkipWidth={12}
          innerPadding={
            groupMode === 'grouped' ? BAR_CHART_MINIMUM_INNER_PADDING : 0
          }
          labelSkipHeight={12}
          valueFormat={(value) =>
            formatGraphValue(Number(value), formatOptions)
          }
          labelTextColor={theme.font.color.primary}
          label={(barDatumCandidate) =>
            formatGraphValue(Number(barDatumCandidate.value), formatOptions)
          }
          tooltip={() => null}
          onMouseEnter={handleBarEnter}
          onMouseLeave={handleBarLeave}
          theme={chartTheme}
          borderRadius={parseInt(theme.border.radius.sm)}
        />
      </GraphWidgetChartContainer>

      {shouldShowBarChartTooltip && (
        <GraphBarChartTooltip
          datum={activeBarTooltip.datum}
          anchorElement={activeBarTooltip.anchorElement}
          containerId={id}
          enrichedKeys={enrichedKeys}
          data={data}
          indexBy={indexBy}
          formatOptions={formatOptions}
          enableGroupTooltip={groupMode === 'stacked'}
          layout={layout}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />
      )}
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
