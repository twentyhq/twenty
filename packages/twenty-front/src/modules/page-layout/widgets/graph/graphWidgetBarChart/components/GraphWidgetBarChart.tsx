import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { CustomBarItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/CustomBarItem';
import { BAR_CHART_MARGINS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMargins';
import { useBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartData';
import { useBarChartHandlers } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartHandlers';
import { useBarChartTheme } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTheme';
import { useBarChartTooltip } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTooltip';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { getBarChartAxisConfigs } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartAxisConfigs';
import { getBarChartColor } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartColor';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ResponsiveBar } from '@nivo/bar';
import { useMemo, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const LEGEND_THRESHOLD = 10;
const LABEL_THRESHOLD = 15;

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
  groupMode = 'grouped',
  seriesLabels,
  rangeMin,
  rangeMax,
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
}: GraphWidgetBarChartProps) => {
  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme);
  const [chartWidth, setChartWidth] = useState<number>(0);
  const [chartHeight, setChartHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };

  const { hoveredBar, setHoveredBar, handleBarClick, hasClickableItems } =
    useBarChartHandlers({
      data,
      indexBy,
    });

  const chartTheme = useBarChartTheme();

  const { barConfigs, enrichedKeys } = useBarChartData({
    data,
    indexBy,
    keys,
    series,
    colorRegistry,
    seriesLabels,
  });

  const { renderTooltip: getTooltipData } = useBarChartTooltip({
    hoveredBar,
    enrichedKeys,
    data,
    indexBy,
    formatOptions,
  });

  const isLargeChart = data.length * keys.length > LABEL_THRESHOLD;
  const areThereTooManyKeys = keys.length > LEGEND_THRESHOLD;

  const shouldShowLabels = showValues && !isLargeChart;

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

  const renderTooltip = (datum: Parameters<typeof getTooltipData>[0]) => {
    const tooltipData = getTooltipData(datum);
    if (!isDefined(tooltipData)) return null;

    return (
      <GraphWidgetTooltip
        items={[tooltipData.tooltipItem]}
        showClickHint={tooltipData.showClickHint}
        title={tooltipData.title}
      />
    );
  };

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
      />
    ),
    [keys, groupMode, data, indexBy, layout],
  );

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
          margin={BAR_CHART_MARGINS}
          padding={0.3}
          groupMode={groupMode}
          layout={layout}
          valueScale={{
            type: 'linear',
            min: rangeMin ?? 'auto',
            max: rangeMax ?? 'auto',
            clamp: true,
          }}
          indexScale={{ type: 'band', round: true }}
          colors={(datum) => getBarChartColor(datum, barConfigs, theme)}
          layers={['grid', 'axes', 'bars', 'markers', 'legends']}
          axisTop={null}
          axisRight={null}
          axisBottom={axisBottomConfig}
          axisLeft={axisLeftConfig}
          enableGridX={layout === 'horizontal' && showGrid}
          enableGridY={layout === 'vertical' && showGrid}
          gridXValues={layout === 'horizontal' ? 5 : undefined}
          gridYValues={layout === 'vertical' ? 5 : undefined}
          enableLabel={shouldShowLabels}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={theme.font.color.primary}
          label={(d) => formatGraphValue(Number(d.value), formatOptions)}
          tooltip={(props) => renderTooltip(props)}
          onClick={handleBarClick}
          onMouseEnter={(datum) => {
            if (isDefined(datum.id) && isDefined(datum.indexValue)) {
              setHoveredBar({
                key: String(datum.id),
                indexValue: datum.indexValue,
              });
            }
          }}
          onMouseLeave={() => setHoveredBar(null)}
          theme={chartTheme}
          borderRadius={parseInt(theme.border.radius.sm)}
        />
      </GraphWidgetChartContainer>
      <GraphWidgetLegend
        show={shouldShowLegend}
        items={enrichedKeys.map((item) => {
          const total = data.reduce(
            (sum, d) => sum + Number(d[item.key] || 0),
            0,
          );
          return {
            id: item.key,
            label: item.label,
            formattedValue: formatGraphValue(total, formatOptions),
            color: item.colorScheme.solid,
          };
        })}
      />
    </StyledContainer>
  );
};
