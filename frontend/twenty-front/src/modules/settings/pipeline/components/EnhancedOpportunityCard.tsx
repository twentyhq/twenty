import { useState } from 'react';
import styled from '@emotion/styled';

import { PIPELINE_STAGES, getProbabilityForStage, calculateWeightedAmount } from '@/modules/settings/pipeline/constants/pipeline-config';

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  margin-top: 8px;
`;

const ProbabilityBadge = styled.div<{ probability: number }>`
  background: ${({ probability }) => 
    probability >= 80 ? '#22C55E' :
    probability >= 60 ? '#3B82F6' :
    probability >= 40 ? '#F59E0B' :
    probability >= 20 ? '#F97316' :
    '#EF4444'
  }20;
  color: ${({ probability }) => 
    probability >= 80 ? '#22C55E' :
    probability >= 60 ? '#3B82F6' :
    probability >= 40 ? '#F59E0B' :
    probability >= 20 ? '#F97316' :
    '#EF4444'
  };
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const WeightedAmount = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StageIndicator = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const LeadSourceTag = styled.div`
  background: ${({ theme }) => theme.background.tertiary};
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

interface EnhancedOpportunityCardProps {
  amount: number | null;
  stage: string;
  leadSource?: string | null;
  probability?: number;
}

export const EnhancedOpportunityCard = ({
  amount,
  stage,
  leadSource,
  probability,
}: EnhancedOpportunityCardProps) => {
  const stageConfig = PIPELINE_STAGES.find((s) => s.key === stage);
  const stageProbability = probability ?? getProbabilityForStage(stage);
  const weighted = calculateWeightedAmount(amount, stage);

  return (
    <div>
      {leadSource && <LeadSourceTag>{leadSource}</LeadSourceTag>}
      <CardFooter>
        <WeightedAmount>
          Ponderado: ${weighted.toLocaleString('es-CO')}
        </WeightedAmount>
        <ProbabilityBadge probability={stageProbability}>
          {stageProbability}%
        </ProbabilityBadge>
      </CardFooter>
    </div>
  );
};
