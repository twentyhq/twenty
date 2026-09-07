import { isNonEmptyString, isString } from '@sniptt/guards';

import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

export const toSlackResolvedUser = ({
  record,
  isInInstalledWorkspace,
}: {
  record: Record<string, unknown>;
  isInInstalledWorkspace: boolean;
}): SlackResolvedUser | undefined => {
  if (!isNonEmptyString(record.slackUserId)) {
    return undefined;
  }

  return {
    slackUserId: record.slackUserId,
    slackTeamId: isString(record.slackTeamId) ? record.slackTeamId : '',
    displayName: isNonEmptyString(record.displayName)
      ? record.displayName
      : undefined,
    email: isNonEmptyString(record.email) ? record.email : undefined,
    isInInstalledWorkspace,
  };
};
