import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { LeadScoreRule } from '../types/marketing.types';

const MOCK_RULES: LeadScoreRule[] = [
  { id: 'LS1', attribute: 'Job Title', condition: 'contains', value: 'Director', points: 20, isActive: true },
  { id: 'LS2', attribute: 'Company Size', condition: 'greater than', value: '500', points: 15, isActive: true },
  { id: 'LS3', attribute: 'Page Views', condition: 'greater than', value: '10', points: 10, isActive: true },
  { id: 'LS4', attribute: 'Email Opens', condition: 'greater than', value: '3', points: 5, isActive: true },
  { id: 'LS5', attribute: 'Downloaded Whitepaper', condition: 'equals', value: 'true', points: 25, isActive: false },
  { id: 'LS6', attribute: 'Demo Requested', condition: 'equals', value: 'true', points: 50, isActive: true },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
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

const StyledPoints = styled.span<{ points: number }>`
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${({ points }) =>
    points >= 25 ? themeCssVariables.color.turquoise
    : points >= 10 ? themeCssVariables.color.blue
    : themeCssVariables.font.color.secondary};
`;

const StyledToggle = styled.span<{ active: boolean }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ active }) =>
    active ? themeCssVariables.color.turquoise : themeCssVariables.color.gray50};
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

export const LeadScoring = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Lead Scoring Rules`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Attribute`}</StyledTh>
            <StyledTh>{t`Condition`}</StyledTh>
            <StyledHideMobileHeader>{t`Value`}</StyledHideMobileHeader>
            <StyledTh>{t`Points`}</StyledTh>
            <StyledTh>{t`Active`}</StyledTh>
          </tr>
        </thead>
        <tbody>
          {MOCK_RULES.map((rule) => (
            <tr key={rule.id}>
              <StyledTd>{rule.attribute}</StyledTd>
              <StyledTd>{rule.condition}</StyledTd>
              <StyledHideMobile>{rule.value}</StyledHideMobile>
              <StyledTd>
                <StyledPoints points={rule.points}>+{rule.points}</StyledPoints>
              </StyledTd>
              <StyledTd>
                <StyledToggle active={rule.isActive}>
                  {rule.isActive ? t`On` : t`Off`}
                </StyledToggle>
              </StyledTd>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
