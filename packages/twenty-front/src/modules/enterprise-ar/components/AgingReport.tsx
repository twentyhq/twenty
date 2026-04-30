import { styled } from '@linaria/atomic';

import { AgingBucket, AgingReportEntry } from '../types/ar.types';

type AgingReportProps = {
  entries: AgingReportEntry[];
};

const BUCKET_LABELS: Record<AgingBucket, string> = {
  current: 'Current',
  '1-30': '1-30 days',
  '31-60': '31-60 days',
  '61-90': '61-90 days',
  '90+': '90+ days',
};

const BUCKET_COLORS: Record<AgingBucket, string> = {
  current: '#22c55e',
  '1-30': '#f59e0b',
  '31-60': '#f97316',
  '61-90': '#ef4444',
  '90+': '#dc2626',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BucketsRow = styled.div`
  display: flex;
  gap: 12px;
`;

const BucketCard = styled.div<{ color: string }>`
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  border-top: 3px solid ${(props) => props.color};
`;

const BucketLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const BucketAmount = styled.div`
  font-size: 20px;
  font-weight: 700;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  text-align: right;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #6b7280;
  &:first-child {
    text-align: left;
  }
`;

const Td = styled.td`
  text-align: right;
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  &:first-child {
    text-align: left;
  }
`;

export const AgingReport = ({ entries }: AgingReportProps) => {
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const totals = entries.reduce(
    (accumulator, entry) => ({
      current: accumulator.current + entry.current,
      days1to30: accumulator.days1to30 + entry.days1to30,
      days31to60: accumulator.days31to60 + entry.days31to60,
      days61to90: accumulator.days61to90 + entry.days61to90,
      days90plus: accumulator.days90plus + entry.days90plus,
      total: accumulator.total + entry.total,
    }),
    {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      days90plus: 0,
      total: 0,
    },
  );

  const bucketTotals: [AgingBucket, number][] = [
    ['current', totals.current],
    ['1-30', totals.days1to30],
    ['31-60', totals.days31to60],
    ['61-90', totals.days61to90],
    ['90+', totals.days90plus],
  ];

  return (
    <Container>
      <BucketsRow>
        {bucketTotals.map(([bucket, amount]) => (
          <BucketCard key={bucket} color={BUCKET_COLORS[bucket]}>
            <BucketLabel>{BUCKET_LABELS[bucket]}</BucketLabel>
            <BucketAmount>{formatAmount(amount)}</BucketAmount>
          </BucketCard>
        ))}
      </BucketsRow>

      <Table>
        <thead>
          <tr>
            <Th>Customer</Th>
            <Th>Current</Th>
            <Th>1-30</Th>
            <Th>31-60</Th>
            <Th>61-90</Th>
            <Th>90+</Th>
            <Th>Total</Th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.customerId}>
              <Td>{entry.customerName}</Td>
              <Td>{formatAmount(entry.current)}</Td>
              <Td>{formatAmount(entry.days1to30)}</Td>
              <Td>{formatAmount(entry.days31to60)}</Td>
              <Td>{formatAmount(entry.days61to90)}</Td>
              <Td>{formatAmount(entry.days90plus)}</Td>
              <Td>{formatAmount(entry.total)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
