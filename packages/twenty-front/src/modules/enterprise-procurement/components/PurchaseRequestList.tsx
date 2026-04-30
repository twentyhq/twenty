import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PRStatus, PurchaseRequest } from '../types/procurement.types';

const MOCK_PRS: PurchaseRequest[] = [
  { id: 'PR-301', title: 'Laptop fleet renewal', requester: 'Ana Torres', department: 'Engineering', status: 'approved', totalAmount: 45000000, currency: 'COP', submittedAt: '2026-04-20', approver: 'Laura Jimenez' },
  { id: 'PR-302', title: 'Office furniture Q2', requester: 'Maria Lopez', department: 'HR', status: 'submitted', totalAmount: 12000000, currency: 'COP', submittedAt: '2026-04-25', approver: 'Laura Jimenez' },
  { id: 'PR-303', title: 'Cloud infrastructure credits', requester: 'Diego Vargas', department: 'Engineering', status: 'ordered', totalAmount: 28000000, currency: 'COP', submittedAt: '2026-04-10', approver: 'Ana Torres' },
  { id: 'PR-304', title: 'Marketing collateral print', requester: 'Sofia Garcia', department: 'Marketing', status: 'rejected', totalAmount: 3500000, currency: 'COP', submittedAt: '2026-04-22', approver: 'Carlos Mendez' },
];

const STATUS_COLORS: Record<PRStatus, string> = {
  draft: themeCssVariables.color.gray50,
  submitted: themeCssVariables.color.yellow,
  approved: themeCssVariables.color.turquoise,
  rejected: themeCssVariables.color.red,
  ordered: themeCssVariables.color.blue,
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

export const PurchaseRequestList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Purchase Requests`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`ID`}</StyledTh>
            <StyledTh>{t`Title`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledTh>{t`Amount`}</StyledTh>
            <StyledHideMobileHeader>{t`Requester`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Approver`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_PRS.map((pr) => (
            <tr key={pr.id}>
              <StyledTd>{pr.id}</StyledTd>
              <StyledTd>{pr.title}</StyledTd>
              <StyledTd>
                <StyledBadge color={STATUS_COLORS[pr.status]}>{pr.status}</StyledBadge>
              </StyledTd>
              <StyledTd>${pr.totalAmount.toLocaleString()}</StyledTd>
              <StyledHideMobile>{pr.requester}</StyledHideMobile>
              <StyledHideMobile>{pr.approver}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
