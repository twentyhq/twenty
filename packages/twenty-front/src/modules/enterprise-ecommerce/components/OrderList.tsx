import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { OrderData, OrderStatus } from '../types/ecommerce.types';

const MOCK_ORDERS: OrderData[] = [
  { id: 'ORD-7001', customerName: 'Maria Lopez', status: 'processing', source: 'website', amount: 245000, currency: 'COP', itemCount: 3, createdAt: '2026-04-29T08:00:00Z' },
  { id: 'ORD-7002', customerName: 'Carlos Ruiz', status: 'shipped', source: 'mobile_app', amount: 89000, currency: 'COP', itemCount: 1, createdAt: '2026-04-28T15:30:00Z' },
  { id: 'ORD-7003', customerName: 'Sofia Garcia', status: 'pending', source: 'marketplace', amount: 520000, currency: 'COP', itemCount: 5, createdAt: '2026-04-29T10:00:00Z' },
  { id: 'ORD-7004', customerName: 'Pedro Gomez', status: 'delivered', source: 'website', amount: 175000, currency: 'COP', itemCount: 2, createdAt: '2026-04-25T12:00:00Z' },
  { id: 'ORD-7005', customerName: 'Ana Torres', status: 'cancelled', source: 'social', amount: 62000, currency: 'COP', itemCount: 1, createdAt: '2026-04-27T09:00:00Z' },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: themeCssVariables.color.yellow,
  processing: themeCssVariables.color.blue,
  shipped: themeCssVariables.color.orange,
  delivered: themeCssVariables.color.turquoise,
  cancelled: themeCssVariables.color.red,
  refunded: themeCssVariables.color.gray50,
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
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

export const OrderList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Orders`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Order`}</StyledTh>
            <StyledTh>{t`Customer`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledTh>{t`Amount`}</StyledTh>
            <StyledHideMobileHeader>{t`Source`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Items`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_ORDERS.map((order) => (
            <tr key={order.id}>
              <StyledTd>{order.id}</StyledTd>
              <StyledTd>{order.customerName}</StyledTd>
              <StyledTd>
                <StyledBadge color={STATUS_COLORS[order.status]}>{order.status}</StyledBadge>
              </StyledTd>
              <StyledTd>${order.amount.toLocaleString()}</StyledTd>
              <StyledHideMobile>{order.source.replace('_', ' ')}</StyledHideMobile>
              <StyledHideMobile>{order.itemCount}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
