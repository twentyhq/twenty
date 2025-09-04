import styled from '@emotion/styled';
import {
  ResponsiveBar,
  type BarCustomLayerProps,
  type BarDatum,
  type ComputedBarDatum,
  type ComputedDatum,
} from '@nivo/bar';
import { useId, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useTheme } from '@emotion/react';
import { type GraphColor } from '../types/GraphColor';
import { type GraphColorScheme } from '../types/GraphColorScheme';
import { createGradientDef } from '../utils/createGradientDef';
import { createGraphColorRegistry } from '../utils/createGraphColorRegistry';
import { getColorScheme } from '../utils/getColorScheme';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '../utils/graphFormatters';
import { GraphWidgetLegend } from './GraphWidgetLegend';
import { GraphWidgetTooltip } from './GraphWidgetTooltip';

type BarChartDataItem = BarDatum & {
  to?: string;
};

type BarChartSeries = {
  key: string;
  label?: string;
  color?: GraphColor;
};

type BarConfig = {
  key: string;
  indexValue: string | number;
  gradientId: string;
  colorScheme: GraphColorScheme;
};

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

const getAxisBottomConfig = (
  layout: 'vertical' | 'horizontal',
  xAxisLabel?: string,
  yAxisLabel?: string,
  formatOptions?: GraphValueFormatOptions,
) => {
  return layout === 'vertical'
    ? {
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: xAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: 40,
      }
    : {
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: yAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: 40,
        format: (value: number) => formatGraphValue(value, formatOptions || {}),
      };
};

const getAxisLeftConfig = (
  layout: 'vertical' | 'horizontal',
  xAxisLabel?: string,
  yAxisLabel?: string,
  formatOptions?: GraphValueFormatOptions,
) => {
  return layout === 'vertical'
    ? {
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: yAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: -50,
        format: (value: number) => formatGraphValue(value, formatOptions || {}),
      }
    : {
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: xAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: -50,
      };
};

const calculateBarEndLineCoordinates = (
  bar: ComputedBarDatum<BarChartDataItem>,
  layout: 'vertical' | 'horizontal',
) => {
  if (layout === 'vertical') {
    return {
      x1: bar.x,
      x2: bar.x + bar.width,
      y1: bar.y,
      y2: bar.y,
    };
  } else {
    return {
      x1: bar.x + bar.width,
      x2: bar.x + bar.width,
      y1: bar.y,
      y2: bar.y + bar.height,
    };
  }
};

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
  const [hoveredBar, setHoveredBar] = useState<{
    key: string;
    indexValue: string | number;
  } | null>(null);

  const colorRegistry = createGraphColorRegistry(theme);

  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };

  const seriesConfigMap = useMemo(() => {
    const map = new Map<string, BarChartSeries>();
    series?.forEach((s) => map.set(s.key, s));
    return map;
  }, [series]);

  const barConfigs = useMemo((): BarConfig[] => {
    return data.flatMap((dataPoint, dataIndex) => {
      const indexValue = dataPoint[indexBy];
      return keys.map((key, keyIndex): BarConfig => {
        const seriesConfig = seriesConfigMap.get(key);
        const colorScheme = getColorScheme(
          colorRegistry,
          seriesConfig?.color,
          keyIndex,
        );
        const gradientId = `gradient-${id}-${instanceId}-${key}-${dataIndex}-${keyIndex}`;

        return {
          key,
          indexValue,
          gradientId,
          colorScheme,
        };
      });
    });
  }, [data, indexBy, keys, colorRegistry, id, instanceId, seriesConfigMap]);

  const enrichedKeys = useMemo(() => {
    return keys.map((key, index) => {
      const seriesConfig = seriesConfigMap.get(key);
      const colorScheme = getColorScheme(
        colorRegistry,
        seriesConfig?.color,
        index,
      );
      return {
        key,
        colorScheme,
        label: seriesConfig?.label || seriesLabels?.[key] || key,
      };
    });
  }, [keys, colorRegistry, seriesConfigMap, seriesLabels]);

  const defs = barConfigs.map((bar) => {
    const isHovered =
      hoveredBar?.key === bar.key && hoveredBar?.indexValue === bar.indexValue;
    return createGradientDef(
      bar.colorScheme,
      bar.gradientId,
      isHovered,
      layout === 'horizontal' ? 0 : 90,
      true,
    );
  });

  const getBarColor = (datum: ComputedDatum<BarDatum>) => {
    const bar = barConfigs.find(
      (b) => b.key === datum.id && b.indexValue === datum.indexValue,
    );
    if (!bar) {
      return theme.border.color.light;
    }
    return `url(#${bar.gradientId})`;
  };

  const handleBarClick = (datum: ComputedDatum<BarDatum>) => {
    const dataItem = data.find((d) => d[indexBy] === datum.indexValue);
    if (isDefined(dataItem?.to)) {
      window.location.href = dataItem.to;
    }
  };

  const renderTooltip = (datum: ComputedDatum<BarDatum>) => {
    const hoveredKey = hoveredBar?.key;
    if (!isDefined(hoveredKey)) return null;

    const enrichedKey = enrichedKeys.find((item) => item.key === hoveredKey);
    if (!enrichedKey) return null;

    const dataItem = data.find((d) => d[indexBy] === datum.indexValue);
    const seriesValue = Number(datum.data[hoveredKey] || 0);
    const tooltipItem = {
      label: enrichedKey.label,
      formattedValue: formatGraphValue(seriesValue, formatOptions),
      dotColor: enrichedKey.colorScheme.solid,
    };

    return (
      <GraphWidgetTooltip
        items={[tooltipItem]}
        showClickHint={isDefined(dataItem?.to)}
      />
    );
  };

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

  const hasClickableItems = data.some((item) => isDefined(item.to));

  const renderBarEndLines = (props: BarCustomLayerProps<BarChartDataItem>) => {
    const { bars } = props;

    if (!bars || bars.length === 0) {
      return null;
    }

    return (
      <g>
        {bars.map((bar: ComputedBarDatum<BarChartDataItem>, index: number) => {
          const enrichedKey = enrichedKeys.find((k) => k.key === bar.data.id);
          if (!enrichedKey) {
            return null;
          }
          const lineColor = enrichedKey.colorScheme.solid;
          const { x1, y1, x2, y2 } = calculateBarEndLineCoordinates(
            bar,
            layout,
          );

          return (
            <line
              key={`${bar.data.id}-${bar.data.indexValue}-endline-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={lineColor}
              strokeWidth={1}
            />
          );
        })}
      </g>
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
          colors={getBarColor}
          defs={defs}
          layers={[
            'grid',
            'axes',
            'bars',
            renderBarEndLines,
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
