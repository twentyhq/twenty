import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { isSlackMessageAuthoredBy } from 'src/logic-functions/utils/is-slack-message-authored-by';
import { resolveSlackRunAsWorkspaceMemberId } from 'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id';

// Any created slackAssistantRequest wakes the worker, including one written by
// hand in the UI, whose slackUserId is whatever the author typed. Acting as that
// member on the strength of the record alone would let anyone who can create one
// borrow a colleague's identity, so Slack has to confirm the named user really
// posted the message first. A request that fails the check still gets an answer,
// just with the agent role.
export const resolveSlackRunAsForRequest = async ({
  client,
  identity,
  slackChannelId,
  parentMessageTimestamp,
  slackMessageTimestamp,
}: {
  client: CoreApiClient;
  identity: SlackUserIdentity | undefined;
  slackChannelId: string;
  parentMessageTimestamp: string;
  slackMessageTimestamp: string;
}): Promise<string | undefined> => {
  if (!isDefined(identity)) {
    return undefined;
  }

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return undefined;
  }

  const { client: slackClient } = slackClientResult;

  const isAuthored = await isSlackMessageAuthoredBy({
    client: slackClient,
    slackChannelId,
    parentMessageTimestamp,
    messageTimestamp: slackMessageTimestamp,
    slackUserId: identity.slackUserId,
  });

  if (!isAuthored) {
    return undefined;
  }

  const workspaceMemberId = await resolveSlackRunAsWorkspaceMemberId({
    client,
    slackClient,
    identity,
  });

  return isNonEmptyString(workspaceMemberId) ? workspaceMemberId : undefined;
};
