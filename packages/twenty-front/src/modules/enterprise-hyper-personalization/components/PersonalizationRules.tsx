import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PersonalizationRuleData } from '../types/personalization.types';

const MOCK_RULES: PersonalizationRuleData[] = [
  { id: 'PR-1', name: 'Enterprise welcome', segment: 'Enterprise', channel: 'Email', condition: 'First login', action: 'Send onboarding guide', isActive: true, lastTriggered: '2026-04-28T10:00:00Z' },
  { id: 'PR-2', name: 'At-risk re-engage', segment: 'At-Risk', channel: 'In-app', condition: 'No login 14d', action: 'Show re-engagement modal', isActive: true, lastTriggered: '2026-04-27T08:00:00Z' },
  { id: 'PR-3', name: 'Upsell trigger', segment: 'Growth', channel: 'Email', condition: 'Usage > 80%', action: 'Send upgrade offer', isActive: false, lastTriggered: '2026-04-20T14:00:00Z' },
  { id: 'PR-4', name: 'Feature adoption', segment: 'All', channel: 'In-app', condition: 'New feature released', action: 'Show feature tooltip', isActive: true, lastTriggered: '2026-04-28T12:00:00Z' },
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

const StyledBadge = styled.span<{ isActive: boolean }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.color.green : themeCssVariables.color.gray50};
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

export const PersonalizationRules = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Personalization Rules`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Rule`}</StyledTh>
            <StyledTh>{t`Segment`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledResponsiveHideHeader>{t`Condition`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Action`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_RULES.map((rule) => (
            <tr key={rule.id}>
              <StyledTd>{rule.name}</StyledTd>
              <StyledTd>{rule.segment}</StyledTd>
              <StyledTd>
                <StyledBadge isActive={rule.isActive}>
                  {rule.isActive ? t`Active` : t`Inactive`}
                </StyledBadge>
              </StyledTd>
              <StyledResponsiveHide>{rule.condition}</StyledResponsiveHide>
              <StyledResponsiveHide>{rule.action}</StyledResponsiveHide>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
