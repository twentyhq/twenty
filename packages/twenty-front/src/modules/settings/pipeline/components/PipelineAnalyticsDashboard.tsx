import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { PIPELINE_STAGES } from '@/modules/settings/pipeline/constants/pipeline-config';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 24px;
`;

const MetricCard = styled.div<{ color?: string }>`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid ${({ color }) => color ?? '#3B82F6'};
`;

const MetricLabel = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 28px;
  font-weight: 600;
`;

const MetricSubtext = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: 12px;
  margin-top: 4px;
`;

const StageBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  padding: 24px;
`;

const StageCard = styled.div<{ color?: string }>`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border-top: 3px solid ${({ color }) => color ?? '#3B82F6'};
`;

const StageName = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
`;

const StageAmount = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StageProbability = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

interface PipelineMetrics {
  totalPipeline: number;
  weightedPipeline: number;
  dealsCount: number;
  avgDealSize: number;
  winRate: number;
  bestCase: number;
  expectedCase: number;
}

interface PipelineAnalyticsDashboardProps {
  metrics?: PipelineMetrics;
  stageData?: Array<{
    stage: string;
    dealsCount: number;
    totalAmount: number;
    weightedAmount: number;
    probability: number;
  }>;
  currency?: string;
}

export const PipelineAnalyticsDashboard = ({
  metrics = {
    totalPipeline: 0,
    weightedPipeline: 0,
    dealsCount: 0,
    avgDealSize: 0,
    winRate: 0,
    bestCase: 0,
    expectedCase: 0,
  },
  stageData = [],
  currency = 'COP',
}: PipelineAnalyticsDashboardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div>
      <DashboardContainer>
        <MetricCard color="#3B82F6">
          <MetricLabel>Pipeline Total</MetricLabel>
          <MetricValue>{formatCurrency(metrics.totalPipeline)}</MetricValue>
          <MetricSubtext>{metrics.dealsCount} oportunidades</MetricSubtext>
        </MetricCard>

        <MetricCard color="#8B5CF6">
          <MetricLabel>Ponderado</MetricLabel>
          <MetricValue>{formatCurrency(metrics.weightedPipeline)}</MetricValue>
          <MetricSubtext>Basado en probabilidad</MetricSubtext>
        </MetricCard>

        <MetricCard color="#10B981">
          <MetricLabel>Tasa de Éxito</MetricLabel>
          <MetricValue>{metrics.winRate}%</MetricValue>
          <MetricSubtext>Histórico de cierres</MetricSubtext>
        </MetricCard>

        <MetricCard color="#F59E0B">
          <MetricLabel>Valor Promedio</MetricLabel>
          <MetricValue>{formatCurrency(metrics.avgDealSize)}</MetricValue>
          <MetricSubtext>Por oportunidad</MetricSubtext>
        </MetricCard>
      </DashboardContainer>

      <StageBreakdown>
        {PIPELINE_STAGES.map((stage) => {
          const stageInfo = stageData.find((s) => s.stage === stage.key);
          return (
            <StageCard key={stage.key} color={stage.color}>
              <StageName>{stage.label}</StageName>
              <StageAmount>
                {formatCurrency(stageInfo?.totalAmount ?? 0)}
              </StageAmount>
              <StageProbability>
                {stageInfo?.dealsCount ?? 0} deals · {stage.probability}%
              </StageProbability>
            </StageCard>
          );
        })}
      </StageBreakdown>
    </div>
  );
};
