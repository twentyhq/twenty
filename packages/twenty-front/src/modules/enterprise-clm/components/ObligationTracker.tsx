import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { Obligation } from '../types/clm.types';

const MOCK_OBLIGATIONS: Obligation[] = [
  { id: 'OB1', contractId: 'C1', description: 'Deliver Q1 compliance report', dueDate: '2026-03-31', responsible: 'Ana Torres', completed: true },
  { id: 'OB2', contractId: 'C1', description: 'Annual security audit submission', dueDate: '2026-06-30', responsible: 'Maria Lopez', completed: false },
  { id: 'OB3', contractId: 'C2', description: 'Data processing impact assessment', dueDate: '2026-05-15', responsible: 'Carlos Mendez', completed: false },
  { id: 'OB4', contractId: 'C1', description: 'Renewal notice (90 days prior)', dueDate: '2027-10-02', responsible: 'Luis Reyes', completed: false },
  { id: 'OB5', contractId: 'C4', description: 'Final invoice reconciliation', dueDate: '2026-01-31', responsible: 'Luis Reyes', completed: true },
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

const StyledItem = styled.div<{ completed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  opacity: ${({ completed }) => (completed ? 0.6 : 1)};
`;

const StyledCheckbox = styled.div<{ checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid ${({ checked }) =>
    checked ? themeCssVariables.color.turquoise : themeCssVariables.border.color.medium};
  background: ${({ checked }) =>
    checked ? themeCssVariables.color.turquoise : 'transparent'};
  flex-shrink: 0;
`;

const StyledDescription = styled.span<{ completed: boolean }>`
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
  flex: 1;
`;

const StyledDue = styled.span<{ isOverdue: boolean }>`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${({ isOverdue }) =>
    isOverdue ? themeCssVariables.color.red : themeCssVariables.font.color.tertiary};
  min-width: 90px;
`;

const StyledResponsible = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  min-width: 100px;
`;

export const ObligationTracker = () => {
  useLingui();
  const now = new Date();

  return (
    <StyledContainer>
      <StyledTitle>{t`Obligations`}</StyledTitle>
      {MOCK_OBLIGATIONS.map((obligation) => {
        const dueDate = new Date(obligation.dueDate);
        const isOverdue = !obligation.completed && dueDate < now;
        return (
          <StyledItem key={obligation.id} completed={obligation.completed}>
            <StyledCheckbox checked={obligation.completed} />
            <StyledDescription completed={obligation.completed}>{obligation.description}</StyledDescription>
            <StyledDue isOverdue={isOverdue}>{obligation.dueDate}</StyledDue>
            <StyledResponsible>{obligation.responsible}</StyledResponsible>
          </StyledItem>
        );
      })}
    </StyledContainer>
  );
};
