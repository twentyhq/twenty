import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { Tag, type TagColor } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';
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

const StyledAttemptsTag = styled(Tag)`
  && {
    min-width: fit-content;
  }
`;

export const SettingsAdminJobStateBadge = ({
  state,
  attemptsMade = 1,
}: SettingsAdminJobStateBadgeProps) => {
  const color = JOB_STATE_COLORS[state] || 'gray';
  const showAttempts = attemptsMade > 1;

  return (
    <StyledContainer>
      <Tag color={color}>{state}</Tag>
      {showAttempts && (
        <StyledAttemptsTag color="red" weight="medium" truncate={false}>
          {plural(attemptsMade, {
            one: `${attemptsMade} attempt`,
            other: `${attemptsMade} attempts`,
          })}
        </StyledAttemptsTag>
      )}
    </StyledContainer>
  );
};
