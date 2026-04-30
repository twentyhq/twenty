import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { TimeEntry } from '../types/project.types';

const MOCK_ENTRIES: TimeEntry[] = [
  { id: 'T1', projectId: 'P1', projectName: 'CRM Migration', taskDescription: 'API integration', hours: 4, date: '2026-04-28', user: 'Ana Torres' },
  { id: 'T2', projectId: 'P1', projectName: 'CRM Migration', taskDescription: 'Data mapping', hours: 3, date: '2026-04-28', user: 'Diego Vargas' },
  { id: 'T3', projectId: 'P2', projectName: 'Mobile App v2', taskDescription: 'UI mockups', hours: 6, date: '2026-04-27', user: 'Diego Vargas' },
  { id: 'T4', projectId: 'P4', projectName: 'Security Audit', taskDescription: 'Pen testing', hours: 8, date: '2026-04-27', user: 'Maria Lopez' },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
  max-width: 640px;
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.label`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledInput = styled.input`
  padding: ${themeCssVariables.spacing[2]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  background: ${themeCssVariables.background.transparent.lighter};
`;

const StyledRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const StyledButton = styled.button`
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  background: ${themeCssVariables.color.blue};
  color: ${themeCssVariables.font.color.inverted};
  border: none;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.md};
  cursor: pointer;
  align-self: flex-start;
`;

const StyledEntryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    gap: ${themeCssVariables.spacing[1]};
  }
`;

const StyledHours = styled.span`
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.color.blue};
`;

export const TimeTracker = () => {
  useLingui();
  const [task, setTask] = useState('');
  const [hours, setHours] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  const totalHours = MOCK_ENTRIES.reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <StyledContainer>
      <StyledTitle>{t`Time Tracker`}</StyledTitle>
      <form onSubmit={handleSubmit}>
        <StyledField>
          <StyledLabel>{t`Task Description`}</StyledLabel>
          <StyledInput value={task} onChange={(e) => setTask(e.target.value)} />
        </StyledField>
        <StyledRow>
          <StyledField>
            <StyledLabel>{t`Hours`}</StyledLabel>
            <StyledInput type="number" value={hours} onChange={(e) => setHours(e.target.value)} min="0.5" step="0.5" />
          </StyledField>
          <StyledField>
            <StyledLabel>{t`Date`}</StyledLabel>
            <StyledInput type="date" defaultValue="2026-04-29" />
          </StyledField>
        </StyledRow>
        <StyledButton type="submit">{t`Log Time`}</StyledButton>
      </form>
      <StyledLabel>{t`Recent Entries`} ({t`Total`}: {totalHours}h)</StyledLabel>
      {MOCK_ENTRIES.map((entry) => (
        <StyledEntryRow key={entry.id}>
          <span>{entry.projectName} - {entry.taskDescription}</span>
          <span>{entry.user} | {entry.date}</span>
          <StyledHours>{entry.hours}h</StyledHours>
        </StyledEntryRow>
      ))}
    </StyledContainer>
  );
};
