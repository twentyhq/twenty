import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { TerritoryData } from '../types/sales.types';

const MOCK_TERRITORIES: TerritoryData[] = [
  { id: 'T-1', name: 'North America East', region: 'NAM', owner: 'Juan Perez', accountCount: 45, revenue: 320000 },
  { id: 'T-2', name: 'North America West', region: 'NAM', owner: 'Maria Lopez', accountCount: 38, revenue: 280000 },
  { id: 'T-3', name: 'EMEA Central', region: 'EMEA', owner: 'Ana Torres', accountCount: 52, revenue: 410000 },
  { id: 'T-4', name: 'LATAM South', region: 'LATAM', owner: 'Luis Reyes', accountCount: 29, revenue: 175000 },
  { id: 'T-5', name: 'APAC Southeast', region: 'APAC', owner: 'Pedro Ruiz', accountCount: 33, revenue: 220000 },
];

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

const StyledResponsiveHide = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledResponsiveHideHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

export const TerritoryMap = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Territory Assignments`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Territory`}</StyledTh>
            <StyledTh>{t`Region`}</StyledTh>
            <StyledTh>{t`Owner`}</StyledTh>
            <StyledResponsiveHideHeader>{t`Accounts`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Revenue`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_TERRITORIES.map((territory) => (
            <tr key={territory.id}>
              <StyledTd>{territory.name}</StyledTd>
              <StyledTd>{territory.region}</StyledTd>
              <StyledTd>{territory.owner}</StyledTd>
              <StyledResponsiveHide>{territory.accountCount}</StyledResponsiveHide>
              <StyledResponsiveHide>${territory.revenue.toLocaleString()}</StyledResponsiveHide>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
