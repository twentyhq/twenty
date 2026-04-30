import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { SequenceStepData } from '../types/omnicanal.types';

const MOCK_STEPS: SequenceStepData[] = [
  { id: 'SS-1', order: 1, channel: 'email', delayDays: 0, subject: 'Introduction email', templateName: 'intro_v2', isActive: true },
  { id: 'SS-2', order: 2, channel: 'email', delayDays: 3, subject: 'Follow-up with case study', templateName: 'case_study', isActive: true },
  { id: 'SS-3', order: 3, channel: 'phone', delayDays: 5, subject: 'Discovery call', templateName: 'call_script_a', isActive: true },
  { id: 'SS-4', order: 4, channel: 'whatsapp', delayDays: 7, subject: 'Quick check-in', templateName: 'checkin_wa', isActive: false },
  { id: 'SS-5', order: 5, channel: 'email', delayDays: 14, subject: 'Final follow-up', templateName: 'breakup_email', isActive: true },
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

const StyledStep = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 8px;
  opacity: ${({ isActive }) => (isActive ? 1 : 0.5)};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StyledOrder = styled.span`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.color.blue};
  min-width: 28px;
`;

const StyledStepContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledSubject = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledMeta = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledBadge = styled.span`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${themeCssVariables.background.transparent.lighter};
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
`;

export const SequenceBuilder = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Sequence Steps`}</StyledTitle>
      {MOCK_STEPS.map((step) => (
        <StyledStep key={step.id} isActive={step.isActive}>
          <StyledOrder>{step.order}</StyledOrder>
          <StyledStepContent>
            <StyledSubject>{step.subject}</StyledSubject>
            <StyledMeta>
              {step.channel} &middot; {t`Day`} {step.delayDays} &middot; {step.templateName}
            </StyledMeta>
          </StyledStepContent>
          <StyledBadge>{step.isActive ? t`Active` : t`Disabled`}</StyledBadge>
        </StyledStep>
      ))}
    </StyledContainer>
  );
};
