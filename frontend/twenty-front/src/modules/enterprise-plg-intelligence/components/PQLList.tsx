import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PQLData } from '../types/plg.types';

const MOCK_PQLS: PQLData[] = [
  { id: 'PQ-1', accountName: 'Acme Corp', contactName: 'Carlos Mendez', pqlScore: 94, signupDate: '2026-03-15', topFeature: 'Pipeline Board', usageFrequency: 'daily', plan: 'Free' },
  { id: 'PQ-2', accountName: 'Beta Inc', contactName: 'Sofia Garcia', pqlScore: 87, signupDate: '2026-04-01', topFeature: 'Email Integration', usageFrequency: 'daily', plan: 'Free' },
  { id: 'PQ-3', accountName: 'Gamma Ltd', contactName: 'Pedro Ruiz', pqlScore: 72, signupDate: '2026-04-10', topFeature: 'Reports', usageFrequency: 'weekly', plan: 'Trial' },
  { id: 'PQ-4', accountName: 'Delta SA', contactName: 'Laura Diaz', pqlScore: 65, signupDate: '2026-04-18', topFeature: 'Contacts', usageFrequency: 'daily', plan: 'Trial' },
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

const StyledScore = styled.span<{ isHigh: boolean }>`
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${({ isHigh }) =>
    isHigh ? themeCssVariables.color.green : themeCssVariables.font.color.primary};
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

export const PQLList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Product Qualified Leads`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Account`}</StyledTh>
            <StyledTh>{t`Contact`}</StyledTh>
            <StyledTh>{t`PQL Score`}</StyledTh>
            <StyledResponsiveHideHeader>{t`Top Feature`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Plan`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_PQLS.map((pql) => (
            <tr key={pql.id}>
              <StyledTd>{pql.accountName}</StyledTd>
              <StyledTd>{pql.contactName}</StyledTd>
              <StyledTd>
                <StyledScore isHigh={pql.pqlScore >= 80}>{pql.pqlScore}</StyledScore>
              </StyledTd>
              <StyledResponsiveHide>{pql.topFeature}</StyledResponsiveHide>
              <StyledResponsiveHide>{pql.plan}</StyledResponsiveHide>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
