import { styled } from '@linaria/atomic';

import { UsageMeter } from '../types/billing.types';

type UsageMetersProps = {
  meters: UsageMeter[];
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MeterCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MeterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
`;

const MeterLabel = styled.span`
  font-weight: 600;
`;

const MeterUsage = styled.span`
  color: #6b7280;
  font-variant-numeric: tabular-nums;
`;

const BarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div<{ percent: number; overage: boolean }>`
  height: 100%;
  width: ${(props) => Math.min(props.percent, 100)}%;
  background: ${(props) => {
    if (props.overage) return '#ef4444';
    if (props.percent > 80) return '#f59e0b';
    return '#3b82f6';
  }};
  border-radius: 4px;
  transition: width 0.3s;
`;

const OverageWarning = styled.span`
  font-size: 11px;
  color: #ef4444;
  font-weight: 600;
`;

export const UsageMeters = ({ meters }: UsageMetersProps) => {
  return (
    <Container>
      {meters.map((meter) => (
        <MeterCard key={meter.metricKey}>
          <MeterHeader>
            <MeterLabel>{meter.metricLabel}</MeterLabel>
            <MeterUsage>
              {meter.currentUsage.toLocaleString()} /{' '}
              {meter.limit.toLocaleString()} {meter.unit}
            </MeterUsage>
          </MeterHeader>
          <BarContainer>
            <BarFill
              percent={meter.percentUsed}
              overage={meter.overage}
            />
          </BarContainer>
          {meter.overage && (
            <OverageWarning>
              Overage: {(meter.currentUsage - meter.limit).toLocaleString()}{' '}
              {meter.unit} over limit
            </OverageWarning>
          )}
        </MeterCard>
      ))}
    </Container>
  );
};
