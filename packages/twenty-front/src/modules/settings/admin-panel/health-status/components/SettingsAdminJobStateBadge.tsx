import { styled } from '@linaria/react';
import { Tag, type TagColor } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { JobState } from '~/generated-admin/graphql';

type SettingsAdminJobStateBadgeProps = {
  state: JobState;
  attemptsMade?: number;
};

const JOB_STATE_COLORS: Record<JobState, TagColor> = {
  [JobState.COMPLETED]: 'green',
  [JobState.FAILED]: 'red',
  [JobState.ACTIVE]: 'blue',
  [JobState.WAITING]: 'gray',
  [JobState.DELAYED]: 'orange',
  [JobState.PRIORITIZED]: 'blue',
  [JobState.WAITING_CHILDREN]: 'gray',
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAttemptBadge = styled.span`
  background-color: ${themeCssVariables.background.danger};
  border: 1px solid ${themeCssVariables.border.color.danger};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

export const SettingsAdminJobStateBadge = ({
  state,
  attemptsMade = 1,
}: SettingsAdminJobStateBadgeProps) => {
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
