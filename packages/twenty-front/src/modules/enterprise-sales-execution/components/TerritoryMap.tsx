import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { TerritoryData } from '../types/sales.types';
import { GET_SALES_EXECUTION_DATA } from '../hooks/useSalesExecution';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const StyledTd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const StyledResponsiveHide = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const StyledResponsiveHideHeader = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const TerritoryMap = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_SALES_EXECUTION_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const territories: TerritoryData[] = data?.salesexecutionData?.territories ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Territory Assignments`}</StyledTitle>
      <StyledTable>
        <thead><tr><StyledTh>{t`Territory`}</StyledTh><StyledTh>{t`Region`}</StyledTh><StyledTh>{t`Owner`}</StyledTh><StyledResponsiveHideHeader>{t`Accounts`}</StyledResponsiveHideHeader><StyledResponsiveHideHeader>{t`Revenue`}</StyledResponsiveHideHeader></tr></thead>
        <tbody>
          {territories.map((territory) => (
            <tr key={territory.id}><StyledTd>{territory.name}</StyledTd><StyledTd>{territory.region}</StyledTd><StyledTd>{territory.owner}</StyledTd><StyledResponsiveHide>{territory.accountCount}</StyledResponsiveHide><StyledResponsiveHide>${territory.revenue.toLocaleString()}</StyledResponsiveHide></tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
