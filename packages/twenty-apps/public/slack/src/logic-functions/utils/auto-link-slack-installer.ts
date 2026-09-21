import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { findSlackUserLink } from 'src/logic-functions/data/find-slack-user-link';
import { findWorkspaceMemberEmailById } from 'src/logic-functions/data/find-workspace-member-email-by-id';
import { persistSlackUserLink } from 'src/logic-functions/utils/persist-slack-user-link';
import { resolveSlackUserByEmail } from 'src/logic-functions/utils/resolve-slack-user-by-email';

export const autoLinkSlackInstaller = async ({
  slackClient,
  slackTeamId,
  workspaceMemberId,
}: {
  slackClient: WebClient;
  slackTeamId: string;
  workspaceMemberId: string | null;
}): Promise<void> => {
  if (!isNonEmptyString(workspaceMemberId)) {
    return;
  }

  const client = new CoreApiClient({ runAs: 'application' });

  const email = await findWorkspaceMemberEmailById(client, workspaceMemberId);

  if (!isNonEmptyString(email)) {
    return;
  }

  const resolvedUser = await resolveSlackUserByEmail(slackClient, email);

  if (!isDefined(resolvedUser) || !resolvedUser.isRegularUserAccount) {
    return;
  }

  const linkTeamId = isNonEmptyString(resolvedUser.slackTeamId)
    ? resolvedUser.slackTeamId
    : slackTeamId;

  const existingLink = await findSlackUserLink(client, {
    slackTeamId: linkTeamId,
    slackUserId: resolvedUser.slackUserId,
  });

  if (isDefined(existingLink)) {
    return;
  }

  await persistSlackUserLink(client, {
    existingLink: undefined,
    isSameMemberRelink: false,
    slackTeamId: linkTeamId,
    slackUserId: resolvedUser.slackUserId,
    workspaceMemberId,
    name: resolvedUser.displayName,
    source: SLACK_USER_LINK_SOURCE.AUTO,
    consentState: SLACK_USER_LINK_CONSENT_STATE.ACTIVE,
  });
};
