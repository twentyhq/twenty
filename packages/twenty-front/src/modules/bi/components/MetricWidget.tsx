import { useMemo } from 'react';
import styled from '@emotion/styled';

const MetricCard = styled.div<{ color?: string }>`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 4px solid ${({ color }) => color ?? '#3B82F6'};
`;

const MetricLabel = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
`;

const MetricChange = styled.div<{ positive?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  margin-top: 8px;
  color: ${({ positive, theme }) =>
    positive ? theme.color.green : theme.color.red};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MetricSubtext = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: 12px;
  margin-top: 4px;
`;

interface MetricWidgetProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'currency' | 'percent' | 'number' | 'days';
  color?: string;
}

export const MetricWidget = ({
  title,
  value,
  previousValue,
  format = 'number',
  color,
}: MetricWidgetProps) => {
  const formattedValue = useMemo(() => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          maximumFractionDigits: 0,
        }).format(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'days':
        return `${value} días`;
      default:
        return value.toLocaleString('es-CO');
    }
  }, [value, format]);

  const change = useMemo(() => {
    if (!previousValue || previousValue === 0) return null;
    return ((value - previousValue) / previousValue) * 100;
  }, [value, previousValue]);

  return (
    <MetricCard color={color}>
      <MetricLabel>{title}</MetricLabel>
      <MetricValue>{formattedValue}</MetricValue>
      {change !== null && (
        <MetricChange positive={change >= 0}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
        </MetricChange>
      )}
    </MetricCard>
  );
};
