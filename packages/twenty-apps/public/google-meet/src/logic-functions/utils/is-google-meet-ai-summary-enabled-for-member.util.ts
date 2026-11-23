import { isDefined } from 'twenty-sdk/utils';

import { GOOGLE_MEET_AI_SUMMARY_ENABLED_APP_VARIABLE_NAME } from 'src/constants/google-meet.constant';

export const isGoogleMeetAiSummaryEnabledForMember = ({
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
      ({ key }) => key === GOOGLE_MEET_AI_SUMMARY_ENABLED_APP_VARIABLE_NAME,
    )?.value;

  return isDefined(aiSummaryEnabledValue) && aiSummaryEnabledValue !== 'false';
};
