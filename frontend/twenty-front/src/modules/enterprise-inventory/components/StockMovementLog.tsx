import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { StockMovement } from '../types/inventory.types';

const MOCK_MOVEMENTS: StockMovement[] = [
  { id: 'M1', sku: 'SKU-001', itemName: 'Widget A', type: 'inbound', quantity: 100, toWarehouse: 'Main Warehouse', performedBy: 'Juan Perez', timestamp: '2026-04-28T09:00:00Z', reference: 'PO-2001' },
  { id: 'M2', sku: 'SKU-002', itemName: 'Widget B', type: 'outbound', quantity: 50, fromWarehouse: 'Main Warehouse', performedBy: 'Maria Lopez', timestamp: '2026-04-28T10:30:00Z', reference: 'SO-3005' },
  { id: 'M3', sku: 'SKU-003', itemName: 'Gadget C', type: 'transfer', quantity: 20, fromWarehouse: 'South Distribution', toWarehouse: 'Main Warehouse', performedBy: 'Carlos Ruiz', timestamp: '2026-04-27T14:00:00Z', reference: 'TR-401' },
  { id: 'M4', sku: 'SKU-004', itemName: 'Part D', type: 'adjustment', quantity: -5, toWarehouse: 'North Hub', performedBy: 'Ana Torres', timestamp: '2026-04-27T16:00:00Z', reference: 'ADJ-101' },
];

const TYPE_COLORS: Record<string, string> = {
  inbound: themeCssVariables.color.turquoise,
  outbound: themeCssVariables.color.blue,
  transfer: themeCssVariables.color.yellow,
  adjustment: themeCssVariables.color.orange,
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

export const StockMovementLog = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Stock Movements`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Date`}</StyledTh>
            <StyledTh>{t`Item`}</StyledTh>
            <StyledTh>{t`Type`}</StyledTh>
            <StyledTh>{t`Qty`}</StyledTh>
            <StyledHideMobileHeader>{t`Reference`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`By`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_MOVEMENTS.map((movement) => (
            <tr key={movement.id}>
              <StyledTd>{new Date(movement.timestamp).toLocaleDateString()}</StyledTd>
              <StyledTd>{movement.itemName}</StyledTd>
              <StyledTd>
                <StyledBadge color={TYPE_COLORS[movement.type]}>{movement.type}</StyledBadge>
              </StyledTd>
              <StyledTd>{movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}</StyledTd>
              <StyledHideMobile>{movement.reference}</StyledHideMobile>
              <StyledHideMobile>{movement.performedBy}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
