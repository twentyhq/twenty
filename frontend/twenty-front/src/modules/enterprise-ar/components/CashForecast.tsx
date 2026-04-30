import { useQuery } from '@apollo/client';
import { styled } from '@linaria/atomic';

import { GET_CASH_FORECAST } from '../hooks/useAccountsReceivable';

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

const SummaryRow = styled.div`
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #374151;
`;

const LoadingMessage = styled.div`
  padding: 16px;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  padding: 16px;
  color: #ef4444;
`;

export const CashForecast = () => {
  const now = new Date();
  const startDate = now.toISOString();
  const endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data, loading, error } = useQuery(GET_CASH_FORECAST, {
    variables: { startDate, endDate, currency: 'USD' },
  });

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (loading) return <LoadingMessage>Loading...</LoadingMessage>;
  if (error) return <ErrorMessage>Error: {error.message}</ErrorMessage>;

  const entries = data?.cashForecast?.entries ?? [];
  const summary = data?.cashForecast?.summary;

  return (
    <Container>
      <ChartPlaceholder>
        Cash flow projection chart - integrate with charting library
      </ChartPlaceholder>

      {summary && (
        <SummaryRow>
          <span>Starting: {formatAmount(summary.startingBalance)}</span>
          <span>Ending: {formatAmount(summary.endingBalance)}</span>
          <span>Net: {formatAmount(summary.netChange)}</span>
        </SummaryRow>
      )}

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
          {entries.map((entry: {
            date: string;
            expectedInflow: number;
            expectedOutflow: number;
            netCash: number;
            cumulativeBalance: number;
          }) => (
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
