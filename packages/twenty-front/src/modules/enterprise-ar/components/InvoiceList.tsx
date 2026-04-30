import { useMutation, useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { CREATE_INVOICE, GET_INVOICES } from '../hooks/useAccountsReceivable';
import { InvoiceStatus } from '../types/ar.types';

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: themeCssVariables.color.gray50,
  sent: themeCssVariables.color.blue,
  viewed: themeCssVariables.color.blue,
  partial: themeCssVariables.color.orange,
  paid: themeCssVariables.color.turquoise,
  overdue: themeCssVariables.color.red,
  written_off: themeCssVariables.color.gray50,
};

const AGING_COLORS: Record<string, string> = {
  current: themeCssVariables.color.turquoise,
  '1-30': themeCssVariables.color.yellow,
  '31-60': themeCssVariables.color.orange,
  '61-90': themeCssVariables.color.red,
  '90+': themeCssVariables.color.red,
};

const STATUS_OPTIONS: InvoiceStatus[] = [
  'draft',
  'sent',
  'viewed',
  'partial',
  'paid',
  'overdue',
  'written_off',
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledToolbar = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
  align-items: center;
`;

const StyledSelect = styled.select`
  padding: 6px 10px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledButton = styled.button`
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: ${themeCssVariables.color.blue};
  color: ${themeCssVariables.font.color.inverted};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledInput = styled.input`
  padding: 6px 10px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 120px;
`;

const StyledForm = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledDot = styled.span<{ color: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
  margin-right: 6px;
`;

const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledHideMobileHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const InvoiceList = () => {
  useLingui();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_INVOICES, {
    variables: { status: statusFilter || undefined, limit: 50, offset: 0 },
  });

  const [createInvoice, { loading: creating }] = useMutation(CREATE_INVOICE, {
    onCompleted: () => {
      setCustomerName('');
      setAmount('');
      setDueDate('');
      setShowForm(false);
      refetch();
    },
  });

  const handleCreate = () => {
    if (!customerName || !amount) return;
    createInvoice({
      variables: {
        input: {
          customerName,
          amount: Number(amount),
          currency: 'USD',
          dueDate: dueDate || undefined,
        },
      },
    });
  };

  const formatCurrency = (value: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
      value,
    );

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const invoices =
    data?.invoices?.edges?.map(
      (edge: { node: Record<string, unknown> }) => edge.node,
    ) ?? [];

  return (
    <StyledContainer>
      <StyledToolbar>
        <StyledSelect
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">{t`All statuses`}</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </StyledSelect>
        <StyledButton onClick={() => setShowForm(!showForm)}>
          {showForm ? t`Cancel` : t`New Invoice`}
        </StyledButton>
      </StyledToolbar>

      {showForm && (
        <StyledForm>
          <StyledInput
            placeholder={t`Customer name`}
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
          />
          <StyledInput
            type="number"
            placeholder={t`Amount`}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <StyledInput
            type="date"
            placeholder={t`Due date`}
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          <StyledButton onClick={handleCreate} disabled={creating}>
            {creating ? t`Creating...` : t`Create`}
          </StyledButton>
        </StyledForm>
      )}

      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Invoice #`}</StyledTh>
            <StyledTh>{t`Customer`}</StyledTh>
            <StyledTh>{t`Amount`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledHideMobileHeader>{t`Due Date`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Aging`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {invoices.map(
            (invoice: {
              id: string;
              number: string;
              customerName: string;
              amount: number;
              currency: string;
              status: InvoiceStatus;
              dueDate: string;
              agingBucket: string;
            }) => (
              <tr key={invoice.id}>
                <StyledTd>{invoice.number}</StyledTd>
                <StyledTd>{invoice.customerName}</StyledTd>
                <StyledTd>
                  {formatCurrency(invoice.amount, invoice.currency)}
                </StyledTd>
                <StyledTd>
                  <StyledBadge
                    color={
                      STATUS_COLORS[invoice.status] ??
                      themeCssVariables.color.gray50
                    }
                  >
                    {invoice.status.replace('_', ' ')}
                  </StyledBadge>
                </StyledTd>
                <StyledHideMobile>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </StyledHideMobile>
                <StyledHideMobile>
                  <StyledDot
                    color={
                      AGING_COLORS[invoice.agingBucket] ??
                      themeCssVariables.color.gray50
                    }
                  />
                  {invoice.agingBucket}
                </StyledHideMobile>
              </tr>
            ),
          )}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
