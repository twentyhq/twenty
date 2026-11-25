import { isDefined } from 'twenty-sdk/utils';

import { MEET_AI_SUMMARY_ENABLED_APP_VARIABLE_NAME } from 'src/constants/meet.constant';

export const isMeetAiSummaryEnabledForMember = ({
  memberApplicationVariables,
  userWorkspaceId,
}: {
  memberApplicationVariables: {
    userWorkspaceId: string;
    variables: { key: string; value: string }[];
  }[];
  userWorkspaceId: string;
}): boolean => {
  const aiSummaryEnabledValue = memberApplicationVariables
    .find((member) => member.userWorkspaceId === userWorkspaceId)
    ?.variables.find(
      ({ key }) => key === MEET_AI_SUMMARY_ENABLED_APP_VARIABLE_NAME,
    )?.value;

  return isDefined(aiSummaryEnabledValue) && aiSummaryEnabledValue !== 'false';
};
