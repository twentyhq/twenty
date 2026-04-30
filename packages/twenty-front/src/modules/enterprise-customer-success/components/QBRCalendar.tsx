import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { QBRData } from '../types/cs.types';

const MOCK_QBRS: QBRData[] = [
  { id: 'Q-1', accountName: 'Acme Corp', csm: 'Ana Torres', scheduledDate: '2026-05-05T14:00:00Z', quarter: 'Q2 2026', status: 'scheduled' },
  { id: 'Q-2', accountName: 'Delta SA', csm: 'Maria Lopez', scheduledDate: '2026-05-12T10:00:00Z', quarter: 'Q2 2026', status: 'scheduled' },
  { id: 'Q-3', accountName: 'Beta Inc', csm: 'Luis Reyes', scheduledDate: '2026-04-20T16:00:00Z', quarter: 'Q2 2026', status: 'completed' },
  { id: 'Q-4', accountName: 'Gamma Ltd', csm: 'Ana Torres', scheduledDate: '2026-05-18T09:00:00Z', quarter: 'Q2 2026', status: 'scheduled' },
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

const StyledBadge = styled.span<{ isCompleted: boolean }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ isCompleted }) =>
    isCompleted ? themeCssVariables.color.green : themeCssVariables.color.blue};
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

export const QBRCalendar = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Quarterly Business Reviews`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Account`}</StyledTh>
            <StyledTh>{t`Date`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledResponsiveHideHeader>{t`CSM`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Quarter`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_QBRS.map((qbr) => (
            <tr key={qbr.id}>
              <StyledTd>{qbr.accountName}</StyledTd>
              <StyledTd>{new Date(qbr.scheduledDate).toLocaleDateString()}</StyledTd>
              <StyledTd>
                <StyledBadge isCompleted={qbr.status === 'completed'}>{qbr.status}</StyledBadge>
              </StyledTd>
              <StyledResponsiveHide>{qbr.csm}</StyledResponsiveHide>
              <StyledResponsiveHide>{qbr.quarter}</StyledResponsiveHide>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
