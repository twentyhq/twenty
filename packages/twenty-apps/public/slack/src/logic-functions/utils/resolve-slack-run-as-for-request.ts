import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findSlackAssistantRequestCreatedBy } from 'src/logic-functions/data/find-slack-assistant-request-created-by';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { findSlackMessage } from 'src/logic-functions/utils/find-slack-message';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { normalizeSlackRequestText } from 'src/logic-functions/utils/normalize-slack-request-text';
import { resolveSlackBotUserIdOrThrow } from 'src/logic-functions/utils/resolve-slack-bot-user-id-or-throw';
import { resolveSlackRunAsWorkspaceMemberId } from 'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id';

const APPLICATION_ACTOR_SOURCE = 'APPLICATION';

// Any created slackAssistantRequest wakes the worker, including one written by
// hand, whose slackUserId and requestText are whatever the author typed. Acting
// as the named member on the strength of the record alone would let anyone able
// to create one borrow a colleague's identity, so the record has to survive
// three checks before run-as applies, and a record that fails any of them still
// gets an answer, just with the agent role.
//
// The actor stops the ordinary path: a record written through the UI carries the
// author's own workspace member. It is not sufficient on its own, because a
// caller who supplies `createdBy` wholesale can name the application.
//
// Slack settles the rest, and cannot be talked into lying: the referenced
// message must exist, must have been posted by the named user, and must still
// say what the request claims it said. Without the text check, someone could
// pair a colleague's real message coordinates with an instruction of their own
// and have the agent run it as that colleague.
export const resolveSlackRunAsForRequest = async ({
  client,
  identity,
  requestId,
  requestText,
  slackChannelId,
  parentMessageTimestamp,
  slackMessageTimestamp,
}: {
  client: CoreApiClient;
  identity: SlackUserIdentity | undefined;
  requestId: string;
  requestText: string;
  slackChannelId: string;
  parentMessageTimestamp: string;
  slackMessageTimestamp: string;
}): Promise<string | undefined> => {
  if (!isDefined(identity)) {
    return undefined;
  }

  const createdBy = await findSlackAssistantRequestCreatedBy(
    client,
    requestId,
  ).catch(() => undefined);

  if (
    !isDefined(createdBy) ||
    createdBy.source !== APPLICATION_ACTOR_SOURCE ||
    isDefined(createdBy.workspaceMemberId)
  ) {
    return undefined;
  }

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return undefined;
  }

  const { client: slackClient } = slackClientResult;

  const message = await findSlackMessage({
    client: slackClient,
    slackChannelId,
    parentMessageTimestamp,
    messageTimestamp: slackMessageTimestamp,
  });

  if (!isDefined(message) || message.user !== identity.slackUserId) {
    return undefined;
  }

  const botUserId = await resolveSlackBotUserIdOrThrow().catch(() => undefined);

  const messageRequestText = normalizeSlackRequestText({
    text: message.text ?? '',
    botUserId,
  });

  if (messageRequestText !== requestText) {
    return undefined;
  }

  return await resolveSlackRunAsWorkspaceMemberId({
    client,
    slackClient,
    identity,
  });
};
