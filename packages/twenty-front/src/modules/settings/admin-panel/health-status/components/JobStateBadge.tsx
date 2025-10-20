import styled from '@emotion/styled';
import { Tag, type TagColor } from 'twenty-ui/components';
import { JobState } from '~/generated-metadata/graphql';

type JobStateBadgeProps = {
  state: JobState;
  attemptsMade?: number;
};

const JOB_STATE_COLORS: Record<JobState, TagColor> = {
  [JobState.completed]: 'green',
  [JobState.failed]: 'red',
  [JobState.active]: 'blue',
  [JobState.waiting]: 'gray',
  [JobState.delayed]: 'orange',
  [JobState.prioritized]: 'blue',
  [JobState.waitingChildren]: 'gray',
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledAttemptBadge = styled.span`
  background-color: ${({ theme }) => theme.background.danger};
  border: 1px solid ${({ theme }) => theme.border.color.danger};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.danger};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => `${theme.spacing(0.5)} ${theme.spacing(1)}`};
  white-space: nowrap;
`;

export const JobStateBadge = ({
  state,
  attemptsMade = 1,
}: JobStateBadgeProps) => {
  const color = JOB_STATE_COLORS[state] || 'gray';
  const showAttempts = attemptsMade > 1;

  return (
    <StyledContainer>
      <Tag color={color} text={state} />
      {showAttempts && (
        <StyledAttemptBadge>{attemptsMade} attempts</StyledAttemptBadge>
      )}
    </StyledContainer>
  );
};
