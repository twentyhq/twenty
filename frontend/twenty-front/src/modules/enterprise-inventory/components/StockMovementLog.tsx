import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { GET_INVENTORY_ITEMS } from '../hooks/useInventory';

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

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const StockMovementLog = () => {
  useLingui();

  const { data, loading, error } = useQuery(GET_INVENTORY_ITEMS, {
    variables: { limit: 50, offset: 0 },
  });

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const items = data?.inventoryItems?.edges?.map(
    (edge: { node: Record<string, unknown> }) => edge.node,
  ) ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`Stock Movements`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Date`}</StyledTh>
            <StyledTh>{t`Item`}</StyledTh>
            <StyledTh>{t`SKU`}</StyledTh>
            <StyledTh>{t`Stock`}</StyledTh>
            <StyledHideMobileHeader>{t`Warehouse`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Value`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {items.map((item: {
            id: string;
            productName: string;
            sku: string;
            currentStock: number;
            availableStock: number;
            warehouseName: string;
            totalValue: number;
            lastMovementAt: string;
          }) => (
            <tr key={item.id}>
              <StyledTd>{item.lastMovementAt ? new Date(item.lastMovementAt).toLocaleDateString() : '---'}</StyledTd>
              <StyledTd>{item.productName}</StyledTd>
              <StyledTd>
                <StyledBadge color={TYPE_COLORS.inbound}>{item.sku}</StyledBadge>
              </StyledTd>
              <StyledTd>{item.currentStock} ({item.availableStock} {t`available`})</StyledTd>
              <StyledHideMobile>{item.warehouseName}</StyledHideMobile>
              <StyledHideMobile>${item.totalValue?.toLocaleString()}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
