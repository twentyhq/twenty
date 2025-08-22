import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
    ResponsivePie,
    type ComputedDatum,
    type DatumId,
    type PieCustomLayerProps,
} from '@nivo/pie';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { createGradientDef } from '../utils/createGradientDef';
import { createGraphColorRegistry } from '../utils/createGraphColorRegistry';
import { getColorSchemeByIndex } from '../utils/getColorSchemeByIndex';
import {
    formatGraphValue,
    type GraphValueFormatOptions,
} from '../utils/graphFormatters';
import { GraphWidgetTooltip } from './GraphWidgetTooltip';

type GraphWidgetPieChartProps = {
  data: Array<{ id: string; value: number; label?: string }>;
  showLegend?: boolean;
  tooltipHref?: string;
  id: string;
} & GraphValueFormatOptions;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const StyledChartContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
`;

const StyledLegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(3)};

  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)} 0;
`;

const StyledLegendItem = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledLegendLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledLegendValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledDot = styled.div<{ $color: string }>`
  background: ${({ $color }) => $color};
  border-radius: 50%;
  height: 6px;
  width: 6px;
  flex-shrink: 0;
`;

export const GraphWidgetPieChart = ({
  data,
  showLegend = true,
  tooltipHref,
  id,
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
}: GraphWidgetPieChartProps) => {
  const theme = useTheme();
  const [hoveredSliceId, setHoveredSliceId] = useState<DatumId | null>(null);

  const colorRegistry = createGraphColorRegistry(theme);

  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const enrichedData = data.map((item, index) => {
    const colorScheme = getColorSchemeByIndex(colorRegistry, index);
    const isHovered = hoveredSliceId === item.id;
    const gradientId = `${colorScheme.name}Gradient-${id}-${index}`;

    return {
      ...item,
      gradientId,
      colorScheme,
      isHovered,
      percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    };
  });

  const defs = enrichedData.map((item) =>
    createGradientDef(item.colorScheme, item.gradientId, item.isHovered),
  );

  const fill = enrichedData.map((item) => ({
    match: { id: item.id },
    id: item.gradientId,
  }));

  const handleSliceClick = () => {
    if (isDefined(tooltipHref)) {
      window.location.href = tooltipHref;
    }
  };

  const renderTooltip = (
    datum: ComputedDatum<{ id: string; value: number; label?: string }>,
  ) => {
    const item = enrichedData.find((d) => d.id === datum.id);
    if (!item) return null;

    const formattedValue = formatGraphValue(item.value, formatOptions);
    const formattedWithPercentage = `${formattedValue} (${item.percentage.toFixed(1)}%)`;

    return (
      <GraphWidgetTooltip
        items={[
          {
            label: item.label || item.id,
            formattedValue: formattedWithPercentage,
            dotColor: item.colorScheme.solid,
          },
        ]}
        showClickHint={isDefined(tooltipHref)}
      />
    );
  };

  const renderSliceEndLines = (
    layerProps: PieCustomLayerProps<{
      id: string;
      value: number;
      label?: string;
    }>,
  ) => {
    const { dataWithArc, centerX, centerY, innerRadius, radius } = layerProps;

    if (!dataWithArc || !Array.isArray(dataWithArc) || dataWithArc.length < 2) {
      return null;
    }

    // Draw lines at the end of each slice (which creates lines between all slices)
    return (
      <g>
        {dataWithArc.map((datum) => {
          // Find the corresponding enriched data item to get the color scheme
          const enrichedItem = enrichedData.find((d) => d.id === datum.id);
          const lineColor = enrichedItem
            ? enrichedItem.colorScheme.solid
            : theme.border.color.strong;

          // Calculate line position at the end angle of this slice
          const angle = datum.arc.endAngle - Math.PI / 2;
          const x1 = centerX + Math.cos(angle) * innerRadius;
          const y1 = centerY + Math.sin(angle) * innerRadius;
          const x2 = centerX + Math.cos(angle) * radius;
          const y2 = centerY + Math.sin(angle) * radius;

          return (
            <line
              key={`${datum.id}-separator`}
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
      <StyledChartContainer>
        <ResponsivePie
          data={data}
          innerRadius={0.8}
          colors={enrichedData.map((item) => `url(#${item.gradientId})`)}
          borderWidth={0}
          enableArcLinkLabels={false}
          enableArcLabels={false}
          tooltip={({ datum }) => renderTooltip(datum)}
          onClick={handleSliceClick}
          onMouseEnter={(datum) => setHoveredSliceId(datum.id)}
          onMouseLeave={() => setHoveredSliceId(null)}
          defs={defs}
          fill={fill}
          layers={[
            'arcs',
            renderSliceEndLines,
            'arcLinkLabels',
            'arcLabels',
            'legends',
          ]}
        />
      </StyledChartContainer>
      {showLegend && (
        <StyledLegendContainer>
          {enrichedData.map((item) => (
            <StyledLegendItem key={item.id}>
              <StyledDot $color={item.colorScheme.solid} />
              <StyledLegendLabel>{item.label || item.id}</StyledLegendLabel>
              <StyledLegendValue>
                {formatGraphValue(item.value, formatOptions)}
              </StyledLegendValue>
            </StyledLegendItem>
          ))}
        </StyledLegendContainer>
      )}
    </StyledContainer>
  );
};
