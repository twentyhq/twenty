import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { StockItem } from '../types/inventory.types';

const MOCK_STOCK: StockItem[] = [
  { id: '1', sku: 'SKU-001', name: 'Widget A', warehouseId: 'W1', quantity: 250, reorderPoint: 50, level: 'in_stock', unitCost: 12.5 },
  { id: '2', sku: 'SKU-002', name: 'Widget B', warehouseId: 'W1', quantity: 15, reorderPoint: 30, level: 'low_stock', unitCost: 8.0 },
  { id: '3', sku: 'SKU-003', name: 'Gadget C', warehouseId: 'W2', quantity: 0, reorderPoint: 20, level: 'out_of_stock', unitCost: 45.0 },
  { id: '4', sku: 'SKU-004', name: 'Part D', warehouseId: 'W2', quantity: 500, reorderPoint: 100, level: 'in_stock', unitCost: 3.25 },
  { id: '5', sku: 'SKU-005', name: 'Component E', warehouseId: 'W1', quantity: 22, reorderPoint: 25, level: 'low_stock', unitCost: 19.0 },
];

const LEVEL_COLORS: Record<string, string> = {
  in_stock: themeCssVariables.color.turquoise,
  low_stock: themeCssVariables.color.orange,
  out_of_stock: themeCssVariables.color.red,
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div<{ borderColor: string }>`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: 4px solid ${({ borderColor }) => borderColor};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSku = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledAlert = styled.span`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

export const StockDashboard = () => {
  useLingui();

  const alerts = MOCK_STOCK.filter((item) => item.level !== 'in_stock');

  return (
    <StyledContainer>
      <StyledTitle>{t`Stock Levels`}</StyledTitle>
      {alerts.length > 0 && (
        <StyledAlert>{t`${alerts.length} items need attention`}</StyledAlert>
      )}
      <StyledGrid>
        {MOCK_STOCK.map((item) => (
          <StyledCard key={item.id} borderColor={LEVEL_COLORS[item.level]}>
            <StyledSku>{item.sku}</StyledSku>
            <StyledName>{item.name}</StyledName>
            <StyledRow>
              <span>{t`Qty`}: {item.quantity}</span>
              <span>{t`Reorder`}: {item.reorderPoint}</span>
            </StyledRow>
            <StyledRow>
              <span>{t`Cost`}: ${item.unitCost.toFixed(2)}</span>
              <span>{item.level.replace('_', ' ')}</span>
            </StyledRow>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
