import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { InvoiceData } from '../types/saas.types';
import { GET_SAAS_PLATFORM_ANALYTICS } from '../hooks/useSaaSPlatform';

const STATUS_COLORS: Record<string, string> = { paid: themeCssVariables.color.green, pending: themeCssVariables.color.yellow, overdue: themeCssVariables.color.red };
const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const StyledTd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const StyledBadge = styled.span<{ color: string }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${({ color }) => color}; color: ${themeCssVariables.font.color.inverted}; `;
const StyledRH = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const StyledRHH = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const BillingOverview = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_SAAS_PLATFORM_ANALYTICS);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const invoices: InvoiceData[] = data?.saasplatformAnalytics?.invoices ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Billing Overview`}</StyledTitle>
      <StyledTable>
        <thead><tr><StyledTh>{t`Tenant`}</StyledTh><StyledTh>{t`Amount`}</StyledTh><StyledTh>{t`Status`}</StyledTh><StyledRHH>{t`Issued`}</StyledRHH><StyledRHH>{t`Due`}</StyledRHH></tr></thead>
        <tbody>{invoices.map((inv) => (<tr key={inv.id}><StyledTd>{inv.tenantName}</StyledTd><StyledTd>${inv.amount.toLocaleString()}</StyledTd><StyledTd><StyledBadge color={STATUS_COLORS[inv.status] ?? themeCssVariables.color.gray50}>{inv.status}</StyledBadge></StyledTd><StyledRH>{inv.issuedAt}</StyledRH><StyledRH>{inv.dueDate}</StyledRH></tr>))}</tbody>
      </StyledTable>
    </StyledContainer>
  );
};
