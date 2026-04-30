import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { POStatus, PurchaseOrderData } from '../types/trade.types';

const MOCK_ORDERS: PurchaseOrderData[] = [
  { id: 'PO-1', poNumber: 'PO-2026-0001', supplier: 'Shanghai Electronics Co.', status: 'shipped', totalAmount: 45000, currency: 'USD', orderDate: '2026-03-15', expectedDelivery: '2026-05-10', itemCount: 120 },
  { id: 'PO-2', poNumber: 'PO-2026-0002', supplier: 'Berlin Parts GmbH', status: 'confirmed', totalAmount: 18500, currency: 'EUR', orderDate: '2026-04-01', expectedDelivery: '2026-05-20', itemCount: 45 },
  { id: 'PO-3', poNumber: 'PO-2026-0003', supplier: 'Bogota Textiles SAS', status: 'draft', totalAmount: 7200, currency: 'COP', orderDate: '2026-04-28', expectedDelivery: '2026-06-15', itemCount: 300 },
  { id: 'PO-4', poNumber: 'PO-2026-0004', supplier: 'Tokyo Precision Ltd', status: 'delivered', totalAmount: 62000, currency: 'JPY', orderDate: '2026-02-10', expectedDelivery: '2026-04-01', itemCount: 80 },
];

const STATUS_COLORS: Record<POStatus, string> = {
  draft: themeCssVariables.color.gray50,
  submitted: themeCssVariables.color.blue,
  confirmed: themeCssVariables.color.turquoise,
  shipped: themeCssVariables.color.yellow,
  delivered: themeCssVariables.color.green,
  cancelled: themeCssVariables.color.red,
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
  font-weight: ${themeCssVariables.font.weight.medium};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

export const PurchaseOrderList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Trade Import - Purchase Orders`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`PO Number`}</StyledTh>
            <StyledTh>{t`Supplier`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledTh>{t`Amount`}</StyledTh>
            <StyledTh>{t`Items`}</StyledTh>
          </tr>
        </thead>
        <tbody>
          {MOCK_ORDERS.map((order) => (
            <tr key={order.id}>
              <StyledTd>{order.poNumber}</StyledTd>
              <StyledTd>{order.supplier}</StyledTd>
              <StyledTd>
                <StyledBadge color={STATUS_COLORS[order.status]}>
                  {order.status}
                </StyledBadge>
              </StyledTd>
              <StyledTd>{`${order.currency} ${order.totalAmount.toLocaleString()}`}</StyledTd>
              <StyledTd>{order.itemCount}</StyledTd>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
