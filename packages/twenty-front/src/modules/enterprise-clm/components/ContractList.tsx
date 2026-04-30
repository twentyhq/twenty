import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ContractData, ContractStatus } from '../types/clm.types';

const MOCK_CONTRACTS: ContractData[] = [
  { id: 'C1', title: 'SaaS License Agreement', counterparty: 'Bancolombia', status: 'active', value: 1200000, currency: 'COP', startDate: '2026-01-01', endDate: '2027-12-31', owner: 'Maria Lopez' },
  { id: 'C2', title: 'Consulting MSA', counterparty: 'Ecopetrol', status: 'in_review', value: 850000, currency: 'COP', startDate: '2026-05-01', endDate: '2027-04-30', owner: 'Carlos Mendez' },
  { id: 'C3', title: 'Data Processing Addendum', counterparty: 'Avianca', status: 'draft', value: 0, currency: 'COP', startDate: '', endDate: '', owner: 'Ana Torres' },
  { id: 'C4', title: 'Support Contract', counterparty: 'ISA Group', status: 'expired', value: 450000, currency: 'COP', startDate: '2025-01-01', endDate: '2025-12-31', owner: 'Luis Reyes' },
];

const STATUS_COLORS: Record<ContractStatus, string> = {
  draft: themeCssVariables.color.gray50,
  in_review: themeCssVariables.color.yellow,
  approved: themeCssVariables.color.blue,
  active: themeCssVariables.color.turquoise,
  expired: themeCssVariables.color.orange,
  terminated: themeCssVariables.color.red,
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

export const ContractList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Contracts`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Title`}</StyledTh>
            <StyledTh>{t`Counterparty`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledHideMobileHeader>{t`Value`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Expiry`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_CONTRACTS.map((contract) => (
            <tr key={contract.id}>
              <StyledTd>{contract.title}</StyledTd>
              <StyledTd>{contract.counterparty}</StyledTd>
              <StyledTd>
                <StyledBadge color={STATUS_COLORS[contract.status]}>{contract.status.replace('_', ' ')}</StyledBadge>
              </StyledTd>
              <StyledHideMobile>{contract.value ? `$${contract.value.toLocaleString()}` : '—'}</StyledHideMobile>
              <StyledHideMobile>{contract.endDate || '—'}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
