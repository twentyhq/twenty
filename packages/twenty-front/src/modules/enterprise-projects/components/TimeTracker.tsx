import { useMutation } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { LOG_TIME } from '../hooks/useProjects';
import { TimeEntry } from '../types/project.types';

type TimeTrackerProps = {
  projectId: string;
  entries?: TimeEntry[];
};

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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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

const StyledError = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSuccess = styled.div`
  color: ${themeCssVariables.color.turquoise};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const TimeTracker = ({ projectId, entries = [] }: TimeTrackerProps) => {
  useLingui();
  const [task, setTask] = useState('');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [successMessage, setSuccessMessage] = useState('');

  const [logTime, { loading: submitting, error }] = useMutation(LOG_TIME);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!task || !hours) return;

    try {
      await logTime({
        variables: {
          input: {
            projectId,
            taskDescription: task,
            hours: parseFloat(hours),
            date,
          },
        },
      });
      setTask('');
      setHours('');
      setSuccessMessage(t`Time logged successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      // error is captured by the mutation hook
    }
  };

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

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
            <StyledInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </StyledField>
        </StyledRow>
        <StyledButton type="submit" disabled={submitting}>
          {submitting ? t`Logging...` : t`Log Time`}
        </StyledButton>
      </form>
      {error && <StyledError>{t`Error`}: {error.message}</StyledError>}
      {successMessage && <StyledSuccess>{successMessage}</StyledSuccess>}
      <StyledLabel>{t`Recent Entries`} ({t`Total`}: {totalHours}h)</StyledLabel>
      {entries.map((entry) => (
        <StyledEntryRow key={entry.id}>
          <span>{entry.projectName} - {entry.taskDescription}</span>
          <span>{entry.user} | {entry.date}</span>
          <StyledHours>{entry.hours}h</StyledHours>
        </StyledEntryRow>
      ))}
    </StyledContainer>
  );
};
