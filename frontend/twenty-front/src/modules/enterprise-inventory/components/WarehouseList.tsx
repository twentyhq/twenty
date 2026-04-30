import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { GET_STOCK_VALUATION } from '../hooks/useInventory';

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
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledLocation = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledStat = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledBar = styled.div`
  height: 6px;
  border-radius: 3px;
  background: ${themeCssVariables.background.transparent.medium};
  overflow: hidden;
`;

const StyledBarFill = styled.div<{ percent: number; isHigh: boolean }>`
  height: 100%;
  width: ${({ percent }) => percent}%;
  background: ${({ isHigh }) =>
    isHigh ? themeCssVariables.color.orange : themeCssVariables.color.blue};
  border-radius: 3px;
`;

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const WarehouseList = () => {
  useLingui();

  const { data, loading, error } = useQuery(GET_STOCK_VALUATION);

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const warehouses = data?.stockValuation?.byWarehouse ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`Warehouses`}</StyledTitle>
      <StyledGrid>
        {warehouses.map((wh: {
          warehouseId: string;
          warehouseName: string;
          value: number;
          quantity: number;
        }) => {
          const maxQuantity = Math.max(...warehouses.map((w: { quantity: number }) => w.quantity), 1);
          const utilizationPercent = Math.round((wh.quantity / maxQuantity) * 100);
          return (
            <StyledCard key={wh.warehouseId}>
              <StyledName>{wh.warehouseName}</StyledName>
              <StyledLocation>{t`Value`}: ${wh.value?.toLocaleString()}</StyledLocation>
              <StyledStat>
                <span>{t`Units`}: {wh.quantity?.toLocaleString()}</span>
              </StyledStat>
              <StyledStat>
                <span>{t`Relative Fill`}: {utilizationPercent}%</span>
              </StyledStat>
              <StyledBar>
                <StyledBarFill percent={utilizationPercent} isHigh={utilizationPercent > 85} />
              </StyledBar>
            </StyledCard>
          );
        })}
      </StyledGrid>
    </StyledContainer>
  );
};
