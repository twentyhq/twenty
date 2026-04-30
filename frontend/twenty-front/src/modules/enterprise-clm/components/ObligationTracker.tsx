import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { Obligation } from '../types/clm.types';
import { GET_EXPIRING_CONTRACTS } from '../hooks/useCLM';

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

  const { data, loading, error } = useQuery(GET_EXPIRING_CONTRACTS, {
    variables: { withinDays: 365 },
  });

  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;

  const obligations: Obligation[] = data?.expiringContracts?.edges?.map((edge: { node: Obligation }) => edge.node) ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`Obligations`}</StyledTitle>
      {obligations.map((obligation) => {
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
