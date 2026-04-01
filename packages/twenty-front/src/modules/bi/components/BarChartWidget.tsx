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
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 20px 0;
`;

const ChartBar = styled.div<{ height: number; color: string }>`
  flex: 1;
  height: ${({ height }) => height}%;
  min-height: 20px;
  background: ${({ color }) => color};
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: height 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const ChartBarTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.background.inverted};
  color: ${({ theme }) => theme.font.color.inverted};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;

  ${ChartBar}:hover & {
    opacity: 1;
  }
`;

const ChartLabels = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ChartLabel = styled.div`
  flex: 1;
  text-align: center;
  font-size: 11px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

interface BarChartData {
  label: string;
  value: number;
}

interface BarChartWidgetProps {
  title?: string;
  data: BarChartData[];
  color?: string;
}

const DEFAULT_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
];

export const BarChartWidget = ({
  title = 'Gráfico de Barras',
  data,
  color = '#3B82F6',
}: BarChartWidgetProps) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      <ChartBody>
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          const barColor = DEFAULT_COLORS[index % DEFAULT_COLORS.length];

          return (
            <ChartBar key={item.label} height={height} color={barColor}>
              <ChartBarTooltip>
                {item.label}: {item.value.toLocaleString('es-CO')}
              </ChartBarTooltip>
            </ChartBar>
          );
        })}
      </ChartBody>
      <ChartLabels>
        {data.map((item) => (
          <ChartLabel key={item.label}>{item.label}</ChartLabel>
        ))}
      </ChartLabels>
    </ChartContainer>
  );
};
