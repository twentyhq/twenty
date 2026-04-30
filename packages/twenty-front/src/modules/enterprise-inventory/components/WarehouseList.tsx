import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { WarehouseData } from '../types/inventory.types';

const MOCK_WAREHOUSES: WarehouseData[] = [
  { id: 'W1', name: 'Main Warehouse', location: 'Bogota, CO', skuCount: 342, totalUnits: 15200, utilizationPercent: 78 },
  { id: 'W2', name: 'South Distribution', location: 'Medellin, CO', skuCount: 198, totalUnits: 8400, utilizationPercent: 45 },
  { id: 'W3', name: 'North Hub', location: 'Barranquilla, CO', skuCount: 87, totalUnits: 3100, utilizationPercent: 92 },
];

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

export const WarehouseList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Warehouses`}</StyledTitle>
      <StyledGrid>
        {MOCK_WAREHOUSES.map((wh) => (
          <StyledCard key={wh.id}>
            <StyledName>{wh.name}</StyledName>
            <StyledLocation>{wh.location}</StyledLocation>
            <StyledStat>
              <span>{t`SKUs`}: {wh.skuCount}</span>
              <span>{t`Units`}: {wh.totalUnits.toLocaleString()}</span>
            </StyledStat>
            <StyledStat>
              <span>{t`Utilization`}: {wh.utilizationPercent}%</span>
            </StyledStat>
            <StyledBar>
              <StyledBarFill percent={wh.utilizationPercent} isHigh={wh.utilizationPercent > 85} />
            </StyledBar>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
