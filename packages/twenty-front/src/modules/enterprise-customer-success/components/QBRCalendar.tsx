import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { QBRData } from '../types/cs.types';
import { GET_CUSTOMER_SUCCESS_ANALYTICS } from '../hooks/useCustomerSuccess';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const StyledTd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const StyledBadge = styled.span<{ isCompleted: boolean }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${({ isCompleted }) => isCompleted ? themeCssVariables.color.green : themeCssVariables.color.blue}; color: ${themeCssVariables.font.color.inverted}; `;
const StyledResponsiveHide = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const StyledResponsiveHideHeader = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const QBRCalendar = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_CUSTOMER_SUCCESS_ANALYTICS);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const qbrs: QBRData[] = data?.customersuccessAnalytics?.qbrs ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Quarterly Business Reviews`}</StyledTitle>
      <StyledTable>
        <thead><tr><StyledTh>{t`Account`}</StyledTh><StyledTh>{t`Date`}</StyledTh><StyledTh>{t`Status`}</StyledTh><StyledResponsiveHideHeader>{t`CSM`}</StyledResponsiveHideHeader><StyledResponsiveHideHeader>{t`Quarter`}</StyledResponsiveHideHeader></tr></thead>
        <tbody>
          {qbrs.map((qbr) => (
            <tr key={qbr.id}><StyledTd>{qbr.accountName}</StyledTd><StyledTd>{new Date(qbr.scheduledDate).toLocaleDateString()}</StyledTd><StyledTd><StyledBadge isCompleted={qbr.status === 'completed'}>{qbr.status}</StyledBadge></StyledTd><StyledResponsiveHide>{qbr.csm}</StyledResponsiveHide><StyledResponsiveHide>{qbr.quarter}</StyledResponsiveHide></tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
