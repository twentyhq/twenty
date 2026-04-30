import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { AccountHealthData, HealthScore } from '../types/cs.types';
import { GET_CUSTOMER_SUCCESS_DATA } from '../hooks/useCustomerSuccess';

const HEALTH_COLORS: Record<HealthScore, string> = { healthy: themeCssVariables.color.green, at_risk: themeCssVariables.color.yellow, churning: themeCssVariables.color.red };
const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const StyledTd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const StyledDot = styled.span<{ color: string }>` display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${({ color }) => color}; margin-right: ${themeCssVariables.spacing[1]}; `;
const StyledRH = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const StyledRHH = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const HealthScoreList = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_CUSTOMER_SUCCESS_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const accounts: AccountHealthData[] = data?.customersuccessData?.accounts ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Account Health`}</StyledTitle>
      <StyledTable>
        <thead><tr><StyledTh>{t`Account`}</StyledTh><StyledTh>{t`Health`}</StyledTh><StyledTh>{t`CSM`}</StyledTh><StyledRHH>{t`NPS`}</StyledRHH><StyledRHH>{t`ARR`}</StyledRHH><StyledRHH>{t`Renewal`}</StyledRHH></tr></thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.id}><StyledTd>{a.accountName}</StyledTd><StyledTd><StyledDot color={HEALTH_COLORS[a.healthScore] ?? themeCssVariables.color.gray50} />{a.healthScore}</StyledTd><StyledTd>{a.csm}</StyledTd><StyledRH>{a.nps}</StyledRH><StyledRH>${a.arr.toLocaleString()}</StyledRH><StyledRH>{a.renewalDate}</StyledRH></tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
