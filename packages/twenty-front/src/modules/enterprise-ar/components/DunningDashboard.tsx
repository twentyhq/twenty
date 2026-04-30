import { styled } from '@linaria/atomic';

import { DunningSequence, DunningStatus } from '../types/ar.types';

type DunningDashboardProps = {
  sequences: DunningSequence[];
  onSequenceClick?: (sequenceId: string) => void;
};

const STATUS_COLORS: Record<DunningStatus, string> = {
  active: '#3b82f6',
  paused: '#f59e0b',
  completed: '#22c55e',
  escalated: '#ef4444',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SummaryRow = styled.div`
  display: flex;
  gap: 12px;
`;

const SummaryCard = styled.div`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 700;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const SequenceCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;

const SequenceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CustomerName = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const SequenceMeta = styled.span`
  font-size: 12px;
  color: #6b7280;
`;

const StatusBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${(props) => props.color};
`;

const PromiseBadge = styled.span`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #7c3aed;
  background: #ede9fe;
`;

export const DunningDashboard = ({
  sequences,
  onSequenceClick,
}: DunningDashboardProps) => {
  const activeCount = sequences.filter(
    (sequence) => sequence.status === 'active',
  ).length;
  const escalatedCount = sequences.filter(
    (sequence) => sequence.status === 'escalated',
  ).length;
  const promiseCount = sequences.filter(
    (sequence) => sequence.paymentPromiseDate !== null,
  ).length;

  return (
    <Container>
      <SummaryRow>
        <SummaryCard>
          <SummaryValue>{activeCount}</SummaryValue>
          <SummaryLabel>Active Sequences</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{escalatedCount}</SummaryValue>
          <SummaryLabel>Escalated</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{promiseCount}</SummaryValue>
          <SummaryLabel>Payment Promises</SummaryLabel>
        </SummaryCard>
      </SummaryRow>

      {sequences.map((sequence) => (
        <SequenceCard
          key={sequence.id}
          onClick={() => onSequenceClick?.(sequence.id)}
        >
          <SequenceInfo>
            <CustomerName>{sequence.customerName}</CustomerName>
            <SequenceMeta>
              Step {sequence.currentStep}/{sequence.totalSteps} - Next action:{' '}
              {new Date(sequence.nextActionDate).toLocaleDateString()}
            </SequenceMeta>
          </SequenceInfo>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {sequence.paymentPromiseDate !== null && (
              <PromiseBadge>
                Promise:{' '}
                {new Date(sequence.paymentPromiseDate).toLocaleDateString()}
              </PromiseBadge>
            )}
            <StatusBadge color={STATUS_COLORS[sequence.status]}>
              {sequence.status}
            </StatusBadge>
          </div>
        </SequenceCard>
      ))}
    </Container>
  );
};
