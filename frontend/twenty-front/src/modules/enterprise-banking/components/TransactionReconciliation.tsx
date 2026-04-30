import { styled } from '@linaria/atomic';

import {
  BankTransaction,
  ReconciliationStatus,
} from '../types/banking.types';

type TransactionReconciliationProps = {
  transactions: BankTransaction[];
  onMatch?: (transactionId: string) => void;
  onExclude?: (transactionId: string) => void;
};

const STATUS_COLORS: Record<ReconciliationStatus, string> = {
  matched: '#22c55e',
  unmatched: '#ef4444',
  partial_match: '#f59e0b',
  excluded: '#94a3b8',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SummaryRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const SummaryCard = styled.div`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 20px;
  font-weight: 700;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #6b7280;
`;

const Td = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
`;

const StatusBadge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${(props) => props.color};
`;

const ActionButton = styled.button`
  padding: 2px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 11px;
  margin-right: 4px;
  &:hover {
    background: #f9fafb;
  }
`;

const Amount = styled.span<{ isCredit: boolean }>`
  font-variant-numeric: tabular-nums;
  color: ${(props) => (props.isCredit ? '#22c55e' : '#1f2937')};
`;

export const TransactionReconciliation = ({
  transactions,
  onMatch,
  onExclude,
}: TransactionReconciliationProps) => {
  const unmatchedCount = transactions.filter(
    (transaction) => transaction.reconciliationStatus === 'unmatched',
  ).length;
  const matchedCount = transactions.filter(
    (transaction) => transaction.reconciliationStatus === 'matched',
  ).length;

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));

  return (
    <Container>
      <SummaryRow>
        <SummaryCard>
          <SummaryValue>{unmatchedCount}</SummaryValue>
          <SummaryLabel>Unmatched</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{matchedCount}</SummaryValue>
          <SummaryLabel>Matched</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryValue>{transactions.length}</SummaryValue>
          <SummaryLabel>Total</SummaryLabel>
        </SummaryCard>
      </SummaryRow>

      <Table>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Description</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th>Invoice</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <Td>
                {new Date(transaction.date).toLocaleDateString()}
              </Td>
              <Td>{transaction.description}</Td>
              <Td>
                <Amount isCredit={transaction.type === 'credit'}>
                  {transaction.type === 'credit' ? '+' : '-'}
                  {formatAmount(transaction.amount)}
                </Amount>
              </Td>
              <Td>
                <StatusBadge
                  color={
                    STATUS_COLORS[transaction.reconciliationStatus]
                  }
                >
                  {transaction.reconciliationStatus.replace('_', ' ')}
                </StatusBadge>
              </Td>
              <Td>
                {transaction.matchedInvoiceNumber ?? '-'}
              </Td>
              <Td>
                {transaction.reconciliationStatus === 'unmatched' && (
                  <>
                    <ActionButton
                      onClick={() => onMatch?.(transaction.id)}
                    >
                      Match
                    </ActionButton>
                    <ActionButton
                      onClick={() => onExclude?.(transaction.id)}
                    >
                      Exclude
                    </ActionButton>
                  </>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
