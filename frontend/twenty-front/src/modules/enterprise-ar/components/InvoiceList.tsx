import { styled } from '@linaria/atomic';

import { Invoice, InvoiceStatus } from '../types/ar.types';

type InvoiceListProps = {
  invoices: Invoice[];
  onInvoiceClick?: (invoiceId: string) => void;
};

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: '#94a3b8',
  sent: '#3b82f6',
  viewed: '#8b5cf6',
  partial: '#f59e0b',
  paid: '#22c55e',
  overdue: '#ef4444',
  written_off: '#6b7280',
};

const AGING_COLORS: Record<string, string> = {
  current: '#22c55e',
  '1-30': '#f59e0b',
  '31-60': '#f97316',
  '61-90': '#ef4444',
  '90+': '#dc2626',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
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

const Row = styled.tr`
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
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

const AgingIndicator = styled.span<{ color: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => props.color};
  margin-right: 6px;
`;

export const InvoiceList = ({ invoices, onInvoiceClick }: InvoiceListProps) => {
  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
      amount,
    );

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <Th>Invoice #</Th>
            <Th>Customer</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th>Due Date</Th>
            <Th>Aging</Th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <Row
              key={invoice.id}
              onClick={() => onInvoiceClick?.(invoice.id)}
            >
              <Td>{invoice.number}</Td>
              <Td>{invoice.customerName}</Td>
              <Td>{formatCurrency(invoice.amount, invoice.currency)}</Td>
              <Td>
                <StatusBadge color={STATUS_COLORS[invoice.status]}>
                  {invoice.status.replace('_', ' ')}
                </StatusBadge>
              </Td>
              <Td>{new Date(invoice.dueDate).toLocaleDateString()}</Td>
              <Td>
                <AgingIndicator
                  color={AGING_COLORS[invoice.agingBucket] ?? '#94a3b8'}
                />
                {invoice.agingBucket}
              </Td>
            </Row>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
