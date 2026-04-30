import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { DealRegistration } from '../types/prm.types';

const MOCK_DEALS: DealRegistration[] = [
  { id: 'DR1', partnerId: 'PR1', partnerName: 'TechSolutions CO', dealName: 'Enterprise CRM - Bancolombia', value: 850000, currency: 'COP', status: 'approved', submittedAt: '2026-04-15', expiresAt: '2026-07-15' },
  { id: 'DR2', partnerId: 'PR2', partnerName: 'DataPros Inc', dealName: 'Analytics Suite - Ecopetrol', value: 420000, currency: 'COP', status: 'submitted', submittedAt: '2026-04-25', expiresAt: '2026-07-25' },
  { id: 'DR3', partnerId: 'PR1', partnerName: 'TechSolutions CO', dealName: 'Cloud Migration - Avianca', value: 1200000, currency: 'COP', status: 'won', submittedAt: '2026-02-10', expiresAt: '2026-05-10' },
  { id: 'DR4', partnerId: 'PR3', partnerName: 'CloudFirst SAS', dealName: 'SaaS Platform - ISA', value: 300000, currency: 'COP', status: 'rejected', submittedAt: '2026-04-01', expiresAt: '2026-07-01' },
];

const STATUS_COLORS: Record<string, string> = {
  submitted: themeCssVariables.color.yellow,
  approved: themeCssVariables.color.blue,
  rejected: themeCssVariables.color.red,
  won: themeCssVariables.color.turquoise,
  lost: themeCssVariables.color.gray50,
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
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

const StyledHideMobileHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

export const DealRegistrations = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Deal Registrations`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Deal`}</StyledTh>
            <StyledTh>{t`Partner`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledHideMobileHeader>{t`Value`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Expires`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_DEALS.map((deal) => (
            <tr key={deal.id}>
              <StyledTd>{deal.dealName}</StyledTd>
              <StyledTd>{deal.partnerName}</StyledTd>
              <StyledTd>
                <StyledBadge color={STATUS_COLORS[deal.status]}>{deal.status}</StyledBadge>
              </StyledTd>
              <StyledHideMobile>${deal.value.toLocaleString()}</StyledHideMobile>
              <StyledHideMobile>{deal.expiresAt}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
