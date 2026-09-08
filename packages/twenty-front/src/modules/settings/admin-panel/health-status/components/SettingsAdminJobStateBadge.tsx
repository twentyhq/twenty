import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { Tag, type TagColor } from 'twenty-ui/data-display';
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
        <Tag
          color="red"
          text={plural(attemptsMade, {
            one: `${attemptsMade} attempt`,
            other: `${attemptsMade} attempts`,
          })}
          weight="medium"
          preventShrink
        />
      )}
    </StyledContainer>
  );
};
