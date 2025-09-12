import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ResponsiveBar, type BarCustomLayerProps } from '@nivo/bar';
import { useId } from 'react';
import { createGraphColorRegistry } from '../../utils/createGraphColorRegistry';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '../../utils/graphFormatters';
import { GraphWidgetLegend } from '../GraphWidgetLegend';
import { GraphWidgetTooltip } from '../GraphWidgetTooltip';
import { BarChartEndLines } from './components/BarChartEndLines';
import { useBarChartData } from './hooks/useBarChartData';
import { useBarChartHandlers } from './hooks/useBarChartHandlers';
import { useBarChartTooltip } from './hooks/useBarChartTooltip';
import { type BarChartDataItem } from './types/BarChartDataItem';
import { type BarChartSeries } from './types/BarChartSeries';
import { getAxisBottomConfig } from './utils/getAxisBottomConfig';
import { getAxisLeftConfig } from './utils/getAxisLeftConfig';
import { getBarColor } from './utils/getBarColor';

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

const StyledChartContainer = styled.div<{ $isClickable?: boolean }>`
  flex: 1;
  position: relative;
  width: 100%;

  ${({ $isClickable }) =>
    $isClickable &&
    `
    svg g[transform] rect[fill^="url(#gradient-"] {
      cursor: pointer;
    }
  `}
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

  const { renderTooltip: createTooltip } = useBarChartTooltip({
    hoveredBar,
    enrichedKeys,
    data,
    indexBy,
    formatOptions,
  });

  const axisBottomConfig = getAxisBottomConfig(
    layout,
    xAxisLabel,
    yAxisLabel,
    formatOptions,
  );

  const axisLeftConfig = getAxisLeftConfig(
    layout,
    xAxisLabel,
    yAxisLabel,
    formatOptions,
  );

  const renderTooltip = (datum: Parameters<typeof createTooltip>[0]) => {
    const tooltipData = createTooltip(datum);
    if (!tooltipData) return null;

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
      <StyledChartContainer $isClickable={hasClickableItems}>
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
          colors={(datum) => getBarColor(datum, barConfigs, theme)}
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
            if (datum.id !== undefined && datum.indexValue !== undefined) {
              setHoveredBar({
                key: String(datum.id),
                indexValue: datum.indexValue,
              });
            }
          }}
          onMouseLeave={() => setHoveredBar(null)}
          theme={{
            axis: {
              domain: {
                line: {
                  stroke: theme.border.color.light,
                  strokeWidth: 1,
                },
              },
              ticks: {
                line: {
                  stroke: theme.border.color.light,
                  strokeWidth: 1,
                },
                text: {
                  fill: theme.font.color.secondary,
                  fontSize: 11,
                },
              },
              legend: {
                text: {
                  fill: theme.font.color.light,
                  fontSize: 12,
                  fontWeight: theme.font.weight.medium,
                },
              },
            },
            grid: {
              line: {
                stroke: theme.border.color.light,
                strokeWidth: 1,
                strokeDasharray: '4 4',
              },
            },
            labels: {
              text: {
                fontSize: 11,
                fontWeight: theme.font.weight.medium,
              },
            },
          }}
        />
      </StyledChartContainer>
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
