import { useMutation, useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  CREATE_ORDER,
  GET_ECOMMERCE_ANALYTICS,
  GET_ORDERS,
} from '../hooks/useECommerce';
import { OrderStatus } from '../types/ecommerce.types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: themeCssVariables.color.yellow,
  processing: themeCssVariables.color.blue,
  shipped: themeCssVariables.color.orange,
  delivered: themeCssVariables.color.turquoise,
  cancelled: themeCssVariables.color.red,
  refunded: themeCssVariables.color.gray50,
};

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  mobile_app: 'Mobile',
  marketplace: 'Marketplace',
  social: 'Social',
  pos: 'POS',
};

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
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

const StyledMetrics = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  flex-wrap: wrap;
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
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
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

export const OrderList = () => {
  useLingui();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('website');

  const { data, loading, error, refetch } = useQuery(GET_ORDERS, {
    variables: { status: statusFilter || undefined, limit: 50 },
  });

  const { data: analyticsData } = useQuery(GET_ECOMMERCE_ANALYTICS);

  const [createOrder, { loading: creating }] = useMutation(CREATE_ORDER, {
    onCompleted: () => {
      setCustomerName('');
      setAmount('');
      setShowForm(false);
      refetch();
    },
  });

  const handleCreate = () => {
    if (!customerName || !amount) return;
    createOrder({
      variables: {
        input: {
          customerName,
          amount: Number(amount),
          source,
          currency: 'USD',
        },
      },
    });
  };

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const orders =
    data?.orders?.edges?.map(
      (edge: { node: Record<string, unknown> }) => edge.node,
    ) ?? [];
  const analytics = analyticsData?.ecommerceAnalytics;

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
              {status}
            </option>
          ))}
        </StyledSelect>
        <StyledButton onClick={() => setShowForm(!showForm)}>
          {showForm ? t`Cancel` : t`New Order`}
        </StyledButton>
      </StyledToolbar>

      {analytics && (
        <StyledMetrics>
          <span>
            {t`Orders`}: {analytics.totalOrders}
          </span>
          <span>
            {t`Revenue`}: ${analytics.totalRevenue?.toLocaleString()}
          </span>
          <span>
            {t`Avg Order`}: ${analytics.avgOrderValue?.toFixed(2)}
          </span>
          <span>
            {t`Conversion`}: {analytics.conversionRate}%
          </span>
        </StyledMetrics>
      )}

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
          <StyledSelect
            value={source}
            onChange={(event) => setSource(event.target.value)}
          >
            {Object.entries(SOURCE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </StyledSelect>
          <StyledButton onClick={handleCreate} disabled={creating}>
            {creating ? t`Creating...` : t`Create`}
          </StyledButton>
        </StyledForm>
      )}

      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Order`}</StyledTh>
            <StyledTh>{t`Customer`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledTh>{t`Amount`}</StyledTh>
            <StyledHideMobileHeader>{t`Source`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Date`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {orders.map(
            (order: {
              id: string;
              customerName: string;
              status: OrderStatus;
              amount: number;
              currency: string;
              source: string;
              createdAt: string;
            }) => (
              <tr key={order.id}>
                <StyledTd>{order.id.slice(0, 8)}</StyledTd>
                <StyledTd>{order.customerName}</StyledTd>
                <StyledTd>
                  <StyledBadge
                    color={
                      STATUS_COLORS[order.status] ??
                      themeCssVariables.color.gray50
                    }
                  >
                    {order.status}
                  </StyledBadge>
                </StyledTd>
                <StyledTd>
                  {order.currency} {order.amount.toLocaleString()}
                </StyledTd>
                <StyledHideMobile>
                  <StyledBadge color={themeCssVariables.color.blue}>
                    {SOURCE_LABELS[order.source] ?? order.source}
                  </StyledBadge>
                </StyledHideMobile>
                <StyledHideMobile>
                  {new Date(order.createdAt).toLocaleDateString()}
                </StyledHideMobile>
              </tr>
            ),
          )}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
