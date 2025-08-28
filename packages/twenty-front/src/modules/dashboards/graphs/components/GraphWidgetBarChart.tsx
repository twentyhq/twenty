import styled from '@emotion/styled';
import { ResponsiveBar, type BarDatum, type ComputedDatum } from '@nivo/bar';
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

type GraphWidgetBarChartProps = {
  data: BarChartDataItem[];
  indexBy: string;
  keys: string[];
  series?: BarChartSeries[];
  showLegend?: boolean;
  showGrid?: boolean;
  showValues?: boolean;
  showGradient?: boolean;
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

  const barConfigs = useMemo(() => {
    const configs: Array<{
      key: string;
      indexValue: string | number;
      gradientId: string;
      colorScheme: GraphColorScheme;
      isHovered: boolean;
    }> = [];

    data.forEach((dataPoint, dataIndex) => {
      const indexValue = dataPoint[indexBy];
      keys.forEach((key, keyIndex) => {
        // Find series config for this key if it exists
        const seriesConfig = series?.find((s) => s.key === key);
        const colorScheme = getColorScheme(
          colorRegistry,
          seriesConfig?.color,
          keyIndex,
        );
        const isHovered =
          hoveredBar?.key === key && hoveredBar?.indexValue === indexValue;
        const gradientId = `gradient-${id}-${instanceId}-${key}-${dataIndex}-${keyIndex}`;

        configs.push({
          key,
          indexValue,
          gradientId,
          colorScheme,
          isHovered,
        });
      });
    });

    return configs;
  }, [data, indexBy, keys, colorRegistry, hoveredBar, id, instanceId, series]);

  const enrichedKeys = useMemo(() => {
    return keys.map((key, index) => {
      const seriesConfig = series?.find((s) => s.key === key);
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
  }, [keys, colorRegistry, series, seriesLabels]);

  const defs = barConfigs.map((bar) =>
    createGradientDef(
      bar.colorScheme,
      bar.gradientId,
      bar.isHovered,
      layout === 'horizontal' ? 0 : 90,
      true,
    ),
  );

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

  const axisBottomConfig =
    layout === 'vertical'
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
          format: (value: number) => formatGraphValue(value, formatOptions),
        };

  const axisLeftConfig =
    layout === 'vertical'
      ? {
          tickSize: 0,
          tickPadding: 5,
          tickRotation: 0,
          legend: yAxisLabel,
          legendPosition: 'middle' as const,
          legendOffset: -50,
          format: (value: number) => formatGraphValue(value, formatOptions),
        }
      : {
          tickSize: 0,
          tickPadding: 5,
          tickRotation: 0,
          legend: xAxisLabel,
          legendPosition: 'middle' as const,
          legendOffset: -50,
        };

  const hasClickableItems = data.some((item) => isDefined(item.to));

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
          animate={true}
          motionConfig="gentle"
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
