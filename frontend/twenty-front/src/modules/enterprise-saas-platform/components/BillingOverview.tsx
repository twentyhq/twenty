import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { InvoiceData } from '../types/saas.types';

const MOCK_INVOICES: InvoiceData[] = [
  { id: 'INV-1', tenantName: 'Acme Corp', amount: 4500, currency: 'USD', status: 'paid', issuedAt: '2026-04-01', dueDate: '2026-04-15' },
  { id: 'INV-2', tenantName: 'Beta Inc', amount: 2800, currency: 'USD', status: 'pending', issuedAt: '2026-04-15', dueDate: '2026-04-30' },
  { id: 'INV-3', tenantName: 'Gamma Ltd', amount: 1200, currency: 'USD', status: 'overdue', issuedAt: '2026-03-15', dueDate: '2026-03-30' },
  { id: 'INV-4', tenantName: 'Delta SA', amount: 6200, currency: 'USD', status: 'paid', issuedAt: '2026-04-01', dueDate: '2026-04-15' },
];

const STATUS_COLORS: Record<string, string> = {
  paid: themeCssVariables.color.green,
  pending: themeCssVariables.color.yellow,
  overdue: themeCssVariables.color.red,
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

export const BillingOverview = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Billing Overview`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Tenant`}</StyledTh>
            <StyledTh>{t`Amount`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledResponsiveHideHeader>{t`Issued`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Due`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_INVOICES.map((invoice) => (
            <tr key={invoice.id}>
              <StyledTd>{invoice.tenantName}</StyledTd>
              <StyledTd>${invoice.amount.toLocaleString()}</StyledTd>
              <StyledTd>
                <StyledBadge color={STATUS_COLORS[invoice.status]}>{invoice.status}</StyledBadge>
              </StyledTd>
              <StyledResponsiveHide>{invoice.issuedAt}</StyledResponsiveHide>
              <StyledResponsiveHide>{invoice.dueDate}</StyledResponsiveHide>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
