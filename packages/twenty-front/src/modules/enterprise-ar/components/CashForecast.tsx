import { styled } from '@linaria/atomic';

import { CashForecastEntry } from '../types/ar.types';

type CashForecastProps = {
  entries: CashForecastEntry[];
  currency?: string;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ChartPlaceholder = styled.div`
  width: 100%;
  height: 240px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 14px;
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

const Positive = styled.span`
  color: #22c55e;
`;

const Negative = styled.span`
  color: #ef4444;
`;

export const CashForecast = ({
  entries,
  currency = 'USD',
}: CashForecastProps) => {
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
      amount,
    );

  return (
    <Container>
      <ChartPlaceholder>
        Cash flow projection chart - integrate with charting library
      </ChartPlaceholder>

      <Table>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Expected Inflow</Th>
            <Th>Expected Outflow</Th>
            <Th>Net Cash</Th>
            <Th>Cumulative Balance</Th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.date}>
              <Td>{new Date(entry.date).toLocaleDateString()}</Td>
              <Td>
                <Positive>{formatAmount(entry.expectedInflow)}</Positive>
              </Td>
              <Td>
                <Negative>{formatAmount(entry.expectedOutflow)}</Negative>
              </Td>
              <Td>
                {entry.netCash >= 0 ? (
                  <Positive>{formatAmount(entry.netCash)}</Positive>
                ) : (
                  <Negative>{formatAmount(entry.netCash)}</Negative>
                )}
              </Td>
              <Td>
                {entry.cumulativeBalance >= 0 ? (
                  <Positive>
                    {formatAmount(entry.cumulativeBalance)}
                  </Positive>
                ) : (
                  <Negative>
                    {formatAmount(entry.cumulativeBalance)}
                  </Negative>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
