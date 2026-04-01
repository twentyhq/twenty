import { useState, useMemo } from 'react';
import styled from '@emotion/styled';

import { MetricWidget } from '@/bi/components/MetricWidget';
import { FunnelWidget } from '@/bi/components/FunnelWidget';
import { BarChartWidget } from '@/bi/components/BarChartWidget';
import { LineChartWidget } from '@/bi/components/LineChartWidget';
import {
  DEFAULT_DASHBOARD_LAYOUT,
  BI_PERIODS,
  BI_WIDGET_TYPES,
  formatMetricValue,
} from '@/bi/constants/bi-config';

const DashboardContainer = styled.div`
  padding: 24px;
  background: ${({ theme }) => theme.background.primary};
  min-height: 100vh;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const DashboardTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
`;

const PeriodSelect = styled.select`
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  background: ${({ theme }) => theme.background.secondary};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
`;

const WidgetWrapper = styled.div<{ x: number; y: number; w: number; h: number }>`
  grid-column: span ${({ w }) => w};
  min-height: ${({ h }) => h * 60}px;
`;

interface DashboardData {
  revenue: number;
  revenueChange: number;
  deals: number;
  dealsChange: number;
  winRate: number;
  winRateChange: number;
  pipelineValue: number;
  pipelineChange: number;
  revenueByPeriod: Array<{ label: string; value: number }>;
  dealsByStage: Array<{ label: string; value: number }>;
  funnel: Array<{ stage: string; count: number; conversionRate: number }>;
  revenueBySource: Array<{ label: string; value: number }>;
}

const mockData: DashboardData = {
  revenue: 45000000,
  revenueChange: 12.5,
  deals: 38,
  dealsChange: 8.3,
  winRate: 32,
  winRateChange: -2.1,
  pipelineValue: 125000000,
  pipelineChange: 15.2,
  revenueByPeriod: [
    { label: 'Ene', value: 5200000 },
    { label: 'Feb', value: 4800000 },
    { label: 'Mar', value: 6100000 },
    { label: 'Abr', value: 5500000 },
    { label: 'May', value: 7200000 },
    { label: 'Jun', value: 6800000 },
  ],
  dealsByStage: [
    { label: 'Nuevo', value: 45 },
    { label: 'Calif.', value: 32 },
    { label: 'Reunión', value: 25 },
    { label: 'Propuesta', value: 18 },
    { label: 'Cliente', value: 12 },
  ],
  funnel: [
    { stage: 'Leads', count: 1200, conversionRate: 100 },
    { stage: 'Calificados', count: 520, conversionRate: 43 },
    { stage: 'Reunión', count: 280, conversionRate: 54 },
    { stage: 'Propuesta', count: 150, conversionRate: 54 },
    { stage: 'Negociación', count: 85, conversionRate: 57 },
    { stage: 'Cerrado', count: 38, conversionRate: 45 },
  ],
  revenueBySource: [
    { label: 'Web', value: 18000000 },
    { label: 'Referidos', value: 12000000 },
    { label: 'Redes', value: 8000000 },
    { label: 'Eventos', value: 4500000 },
    { label: 'Otros', value: 2500000 },
  ],
};

export const BIDashboard = () => {
  const [period, setPeriod] = useState('this_month');

  const widgets = useMemo(() => {
    return DEFAULT_DASHBOARD_LAYOUT.map((widget) => {
      let value = 0;
      let change = 0;

      switch (widget.metric) {
        case 'revenue':
          value = mockData.revenue;
          change = mockData.revenueChange;
          break;
        case 'deals':
          value = mockData.deals;
          change = mockData.dealsChange;
          break;
        case 'winRate':
          value = mockData.winRate;
          change = mockData.winRateChange;
          break;
        case 'pipelineValue':
          value = mockData.pipelineValue;
          change = mockData.pipelineChange;
          break;
      }

      return { ...widget, value, previousValue: value / (1 + change / 100) };
    });
  }, [period]);

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>📊 Dashboard de BI</DashboardTitle>
        <PeriodSelect value={period} onChange={(e) => setPeriod(e.target.value)}>
          {BI_PERIODS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </PeriodSelect>
      </DashboardHeader>

      <DashboardGrid>
        {widgets.map((widget) => (
          <WidgetWrapper
            key={widget.id}
            x={widget.position.x}
            y={widget.position.y}
            w={widget.position.w}
            h={widget.position.h}
          >
            {widget.type === BI_WIDGET_TYPES.METRIC && (
              <MetricWidget
                title={widget.title}
                value={widget.value}
                previousValue={widget.previousValue}
                format={
                  widget.metric === 'winRate'
                    ? 'percent'
                    : widget.metric === 'pipelineValue'
                    ? 'currency'
                    : 'number'
                }
                color={
                  widget.metric === 'revenue'
                    ? '#3B82F6'
                    : widget.metric === 'deals'
                    ? '#10B981'
                    : widget.metric === 'winRate'
                    ? '#F59E0B'
                    : '#8B5CF6'
                }
              />
            )}
            {widget.type === BI_WIDGET_TYPES.LINE_CHART && (
              <LineChartWidget
                title={widget.title}
                data={mockData.revenueByPeriod}
                color="#3B82F6"
              />
            )}
            {widget.type === BI_WIDGET_TYPES.BAR_CHART && (
              <BarChartWidget
                title={widget.title}
                data={mockData.dealsByStage}
              />
            )}
            {widget.type === BI_WIDGET_TYPES.FUNNEL && (
              <FunnelWidget title={widget.title} data={mockData.funnel} />
            )}
            {widget.type === BI_WIDGET_TYPES.PIE_CHART && (
              <BarChartWidget
                title={widget.title}
                data={mockData.revenueBySource}
              />
            )}
          </WidgetWrapper>
        ))}
      </DashboardGrid>
    </DashboardContainer>
  );
};
