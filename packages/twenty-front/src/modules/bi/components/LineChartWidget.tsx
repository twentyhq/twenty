import styled from '@emotion/styled';

const ChartContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 12px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ChartTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const ChartBody = styled.div`
  flex: 1;
  position: relative;
  min-height: 150px;
`;

const SVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const ChartLine = styled.path<{ color: string }>`
  fill: none;
  stroke: ${({ color }) => color};
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const ChartArea = styled.path<{ color: string }>`
  fill: ${({ color }) => color}20;
`;

const ChartDot = styled.circle<{ color: string }>`
  fill: ${({ color }) => color};
  stroke: ${({ theme }) => theme.background.secondary};
  stroke-width: 2;
  cursor: pointer;
  transition: r 0.2s;

  &:hover {
    r: 8;
  }
`;

const ChartGridLine = styled.line`
  stroke: ${({ theme }) => theme.border.color.light};
  stroke-dasharray: 4;
`;

const ChartLabel = styled.text`
  fill: ${({ theme }) => theme.font.color.tertiary};
  font-size: 11px;
`;

interface LineChartData {
  label: string;
  value: number;
}

interface LineChartWidgetProps {
  title?: string;
  data: LineChartData[];
  color?: string;
  showArea?: boolean;
}

export const LineChartWidget = ({
  title = 'Gráfico de Línea',
  data,
  color = '#3B82F6',
  showArea = true,
}: LineChartWidgetProps) => {
  if (data.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>{title}</ChartTitle>
        <ChartBody>No hay datos disponibles</ChartBody>
      </ChartContainer>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value)) * 1.1;
  const minValue = 0;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };

  const width = 100;
  const height = 100;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartWidth,
    y: padding.top + chartHeight - ((d.value - minValue) / (maxValue - minValue)) * chartHeight,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      <ChartBody>
        <SVG viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <ChartGridLine
              key={ratio}
              x1={padding.left}
              y1={padding.top + chartHeight * ratio}
              x2={width - padding.right}
              y2={padding.top + chartHeight * ratio}
            />
          ))}
          {showArea && <ChartArea d={areaPath} color={color} />}
          <ChartLine d={linePath} color={color} />
          {points.map((p, i) => (
            <ChartDot
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              color={color}
            />
          ))}
        </SVG>
      </ChartBody>
    </ChartContainer>
  );
};
