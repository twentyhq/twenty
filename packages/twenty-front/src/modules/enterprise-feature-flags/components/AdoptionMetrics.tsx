import { styled } from '@linaria/atomic';

import { FlagAdoptionMetric } from '../types/flags.types';

type AdoptionMetricsProps = {
  metrics: FlagAdoptionMetric[];
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MetricRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const FlagName = styled.span`
  font-weight: 600;
  font-size: 13px;
  min-width: 160px;
`;

const BarContainer = styled.div`
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${(props) => props.width}%;
  background: #3b82f6;
  border-radius: 4px;
`;

const StatText = styled.span`
  font-size: 12px;
  color: #6b7280;
  min-width: 100px;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

const Percentage = styled.span`
  font-size: 13px;
  font-weight: 700;
  min-width: 44px;
  text-align: right;
`;

export const AdoptionMetrics = ({ metrics }: AdoptionMetricsProps) => {
  const sorted = [...metrics].sort(
    (a, b) => b.adoptionPercentage - a.adoptionPercentage,
  );

  return (
    <Container>
      {sorted.map((metric) => (
        <MetricRow key={metric.flagId}>
          <FlagName>{metric.flagLabel}</FlagName>
          <BarContainer>
            <BarFill width={metric.adoptionPercentage} />
          </BarContainer>
          <StatText>
            {metric.activeUsers}/{metric.totalUsers} users
          </StatText>
          <Percentage>{metric.adoptionPercentage}%</Percentage>
        </MetricRow>
      ))}
    </Container>
  );
};
