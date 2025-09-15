import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { BarChartEndLines } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartEndLines';
import { useBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartData';
import { useBarChartHandlers } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartHandlers';
import { useBarChartTheme } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTheme';
import { useBarChartTooltip } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTooltip';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartSeries } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { getBarChartAxisBottomConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartAxisBottomConfig';
import { getBarChartAxisLeftConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartAxisLeftConfig';
import { getBarChartColor } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartColor';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ResponsiveBar, type BarCustomLayerProps } from '@nivo/bar';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
}: GraphWidgetBarChartProps) => {
  const theme = useTheme();
  const instanceId = useId();
  const colorRegistry = createGraphColorRegistry(theme);

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

  const { barConfigs, enrichedKeys, defs } = useBarChartData({
    data,
    indexBy,
    keys,
    series,
    colorRegistry,
    id,
    instanceId,
    seriesLabels,
    hoveredBar,
    layout,
  });

  const { renderTooltip: getTooltipData } = useBarChartTooltip({
    hoveredBar,
    enrichedKeys,
    data,
    indexBy,
    formatOptions,
  });

  const axisBottomConfig = getBarChartAxisBottomConfig(
    layout,
    xAxisLabel,
    yAxisLabel,
    formatOptions,
  );

  const axisLeftConfig = getBarChartAxisLeftConfig(
    layout,
    xAxisLabel,
    yAxisLabel,
    formatOptions,
  );

  const renderTooltip = (datum: Parameters<typeof getTooltipData>[0]) => {
    const tooltipData = getTooltipData(datum);
    if (!isDefined(tooltipData)) return null;

    return (
      <GraphWidgetTooltip
        items={[tooltipData.tooltipItem]}
        showClickHint={tooltipData.showClickHint}
      />
    );
  };

  const barEndLinesLayer = (props: BarCustomLayerProps<BarChartDataItem>) => {
    return (
      <BarChartEndLines
        bars={props.bars}
        enrichedKeys={enrichedKeys}
        layout={layout}
      />
    );
  };

  return (
    <StyledContainer id={id}>
      <GraphWidgetChartContainer
        $isClickable={hasClickableItems}
        $cursorSelector='svg g[transform] rect[fill^="url(#gradient-"]'
      >
        <ResponsiveBar
          data={data}
          keys={keys}
          indexBy={indexBy}
          margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
          padding={0.3}
          groupMode={groupMode}
          layout={layout}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={(datum) => getBarChartColor(datum, barConfigs, theme)}
          defs={defs}
          layers={[
            'grid',
            'axes',
            'bars',
            barEndLinesLayer,
            'markers',
            'legends',
          ]}
          axisTop={null}
          axisRight={null}
          axisBottom={axisBottomConfig}
          axisLeft={axisLeftConfig}
          enableGridX={layout === 'horizontal' && showGrid}
          enableGridY={layout === 'vertical' && showGrid}
          gridXValues={layout === 'horizontal' ? 5 : undefined}
          gridYValues={layout === 'vertical' ? 5 : undefined}
          enableLabel={showValues}
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
        />
      </GraphWidgetChartContainer>
      <GraphWidgetLegend
        show={showLegend}
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
