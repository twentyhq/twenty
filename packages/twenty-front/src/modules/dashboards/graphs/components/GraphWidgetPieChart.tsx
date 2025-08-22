import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { ResponsivePie, type ComputedDatum, type DatumId } from '@nivo/pie';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight } from 'twenty-ui/display';

type GraphWidgetPieChartProps = {
  data: Array<{ id: string; value: number; label?: string }>;
  unit?: string;
  showLegend?: boolean;
  tooltipHref?: string;
  id: string;
};

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

const StyledTooltipContent = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  pointer-events: none;
`;

const StyledTooltipRow = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.extraLight};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTooltipValue = styled.span`
  margin-left: auto;
  white-space: nowrap;
`;

const StyledTooltipLink = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  cursor: default;
  display: flex;
`;

export const GraphWidgetPieChart = ({
  data,
  unit = '',
  showLegend = true,
  tooltipHref,
  id,
}: GraphWidgetPieChartProps) => {
  const theme = useTheme();
  const [hoveredSliceId, setHoveredSliceId] = useState<DatumId | null>(null);

  const dotColors = [
    theme.color.blue,
    theme.color.green,
    theme.color.orange,
    theme.color.red,
    theme.color.purple,
  ];

  const colorSchemes = [
    {
      name: 'blue',
      normal: [theme.adaptiveColors.blue1, theme.adaptiveColors.blue2],
      hover: [theme.adaptiveColors.blue3, theme.adaptiveColors.blue4],
    },
    {
      name: 'purple',
      normal: [theme.adaptiveColors.purple1, theme.adaptiveColors.purple2],
      hover: [theme.adaptiveColors.purple3, theme.adaptiveColors.purple4],
    },
    {
      name: 'pink',
      normal: [theme.adaptiveColors.pink1, theme.adaptiveColors.pink2],
      hover: [theme.adaptiveColors.pink3, theme.adaptiveColors.pink4],
    },
    {
      name: 'orange',
      normal: [theme.adaptiveColors.orange1, theme.adaptiveColors.orange2],
      hover: [theme.adaptiveColors.orange3, theme.adaptiveColors.orange4],
    },
    {
      name: 'pink',
      normal: [theme.adaptiveColors.pink1, theme.adaptiveColors.pink2],
      hover: [theme.adaptiveColors.pink3, theme.adaptiveColors.pink4],
    },
  ];

  const formatValue = (val: number): string => {
    if (val % 1 !== 0) {
      return val.toFixed(1);
    }
    return val.toString();
  };

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const enrichedData = data.map((item, index) => {
    const colorScheme = colorSchemes[index % colorSchemes.length];
    const isHovered = hoveredSliceId === item.id;
    const colors = isHovered ? colorScheme.hover : colorScheme.normal;
    const gradientId = `${colorScheme.name}Gradient-${id}-${index}`;
    const dotColor = dotColors[index % dotColors.length];

    return {
      ...item,
      gradientId,
      colors,
      colorScheme: colorScheme.name,
      dotColor,
      percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    };
  });

  const defs = enrichedData.flatMap((item) => [
    {
      id: item.gradientId,
      type: 'linearGradient',
      colors: [
        { offset: 0, color: item.colors[0] },
        { offset: 100, color: item.colors[1] },
      ],
    },
  ]);

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

    return (
      <StyledTooltipContent>
        <StyledTooltipRow>
          <StyledDot $color={item.dotColor} />
          <span>{item.label || item.id}</span>
          <StyledTooltipValue>
            {formatValue(item.value)}
            {unit} ({item.percentage.toFixed(1)}%)
          </StyledTooltipValue>
        </StyledTooltipRow>
        <StyledTooltipLink>
          <span>{t`Click to see data`}</span>
          <IconArrowUpRight size={theme.icon.size.sm} />
        </StyledTooltipLink>
      </StyledTooltipContent>
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
        />
      </StyledChartContainer>
      {showLegend && (
        <StyledLegendContainer>
          {enrichedData.map((item) => (
            <StyledLegendItem key={item.id}>
              <StyledDot $color={item.dotColor} />
              <StyledLegendLabel>{item.label || item.id}</StyledLegendLabel>
              <StyledLegendValue>
                {formatValue(item.value)}
                {unit}
              </StyledLegendValue>
            </StyledLegendItem>
          ))}
        </StyledLegendContainer>
      )}
    </StyledContainer>
  );
};
