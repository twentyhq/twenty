import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { WizardStepData, WizardStepStatus } from '../types/wizard.types';

const MOCK_STEPS: WizardStepData[] = [
  { id: 'S-1', order: 1, title: 'Organization Setup', description: 'Configure company name, logo, and basic settings', status: 'completed', isOptional: false },
  { id: 'S-2', order: 2, title: 'Module Selection', description: 'Choose which enterprise modules to activate', status: 'completed', isOptional: false },
  { id: 'S-3', order: 3, title: 'Data Import', description: 'Import existing data from CSV or other CRM systems', status: 'active', isOptional: false },
  { id: 'S-4', order: 4, title: 'Integrations', description: 'Connect external services and APIs', status: 'pending', isOptional: true },
  { id: 'S-5', order: 5, title: 'Team Invitations', description: 'Invite team members and assign roles', status: 'pending', isOptional: false },
];

const STATUS_COLORS: Record<WizardStepStatus, string> = {
  pending: themeCssVariables.color.gray50,
  active: themeCssVariables.color.blue,
  completed: themeCssVariables.color.green,
  skipped: themeCssVariables.color.yellow,
};

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

const StyledStepCard = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${({ isActive }) =>
    isActive ? themeCssVariables.color.blue : themeCssVariables.border.color.light};
  border-radius: 8px;
  background: ${({ isActive }) =>
    isActive ? 'rgba(0, 120, 255, 0.04)' : 'transparent'};
`;

const StyledStepNumber = styled.div<{ color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
  flex-shrink: 0;
`;

const StyledStepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledStepTitle = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledStepDescription = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
`;

export const WizardSteps = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Tenant Setup Wizard`}</StyledTitle>
      {MOCK_STEPS.map((step) => (
        <StyledStepCard key={step.id} isActive={step.status === 'active'}>
          <StyledStepNumber color={STATUS_COLORS[step.status]}>
            {step.order}
          </StyledStepNumber>
          <StyledStepContent>
            <StyledStepTitle>
              {step.title}
              {step.isOptional ? ` (${t`optional`})` : ''}
            </StyledStepTitle>
            <StyledStepDescription>{step.description}</StyledStepDescription>
          </StyledStepContent>
        </StyledStepCard>
      ))}
    </StyledContainer>
  );
};
