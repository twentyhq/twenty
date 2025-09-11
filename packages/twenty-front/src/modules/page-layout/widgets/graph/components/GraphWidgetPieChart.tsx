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

import { type GraphColor } from '../types/GraphColor';
import { createGradientDef } from '../utils/createGradientDef';
import { createGraphColorRegistry } from '../utils/createGraphColorRegistry';
import { getColorScheme } from '../utils/getColorScheme';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '../utils/graphFormatters';
import { GraphWidgetLegend } from './GraphWidgetLegend';
import { GraphWidgetTooltip } from './GraphWidgetTooltip';

type GraphWidgetPieChartProps = {
  data: Array<{
    id: string;
    value: number;
    label?: string;
    color?: GraphColor;
    to?: string;
  }>;
  showLegend?: boolean;
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

const StyledChartContainer = styled.div<{ $isClickable?: boolean }>`
  flex: 1;
  position: relative;
  width: 100%;

  ${({ $isClickable }) =>
    $isClickable &&
    `
    svg g path[fill^="url(#"] {
      cursor: pointer;
    }
  `}
`;

export const GraphWidgetPieChart = ({
  data,
  showLegend = true,
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

  let cumulativeAngle = 0;
  const enrichedData = data.map((item, index) => {
    const colorScheme = getColorScheme(colorRegistry, item.color, index);
    const isHovered = hoveredSliceId === item.id;
    const gradientId = `${colorScheme.name}Gradient-${id}-${index}`;
    const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;

    const sliceAngle = (percentage / 100) * 360;
    const middleAngle = cumulativeAngle + sliceAngle / 2;
    cumulativeAngle += sliceAngle;

    return {
      ...item,
      gradientId,
      colorScheme,
      isHovered,
      percentage,
      middleAngle,
    };
  });

  const defs = enrichedData.map((item) =>
    createGradientDef(
      item.colorScheme,
      item.gradientId,
      item.isHovered,
      item.middleAngle,
    ),
  );

  const fill = enrichedData.map((item) => ({
    match: { id: item.id },
    id: item.gradientId,
  }));

  const handleSliceClick = (
    datum: ComputedDatum<{ id: string; value: number; label?: string }>,
  ) => {
    const clickedItem = data.find((d) => d.id === datum.id);
    if (isDefined(clickedItem?.to)) {
      window.location.href = clickedItem.to;
    }
  };

  const renderTooltip = (
    datum: ComputedDatum<{ id: string; value: number; label?: string }>,
  ) => {
    const item = enrichedData.find((d) => d.id === datum.id);
    if (!item) return null;

    const dataItem = data.find((d) => d.id === datum.id);
    const formattedValue = formatGraphValue(
      displayType === 'percentage' ? item.percentage / 100 : item.value,
      formatOptions,
    );
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
        showClickHint={isDefined(dataItem?.to)}
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

    return (
      <g>
        {dataWithArc.map((datum) => {
          const enrichedItem = enrichedData.find((d) => d.id === datum.id);
          const lineColor = enrichedItem
            ? enrichedItem.colorScheme.solid
            : theme.border.color.strong;

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

  const hasClickableItems = data.some((item) => isDefined(item.to));

  return (
    <StyledContainer id={id}>
      <StyledChartContainer $isClickable={hasClickableItems}>
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
          layers={['arcs', renderSliceEndLines]}
        />
      </StyledChartContainer>
      <GraphWidgetLegend
        show={showLegend}
        items={enrichedData.map((item) => ({
          id: item.id,
          label: item.label || item.id,
          formattedValue: formatGraphValue(
            displayType === 'percentage' ? item.percentage / 100 : item.value,
            formatOptions,
          ),
          color: item.colorScheme.solid,
        }))}
      />
    </StyledContainer>
  );
};
