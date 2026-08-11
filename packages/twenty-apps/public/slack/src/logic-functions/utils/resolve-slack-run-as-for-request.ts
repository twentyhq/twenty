import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findSlackAssistantRequestCreatedBy } from 'src/logic-functions/data/find-slack-assistant-request-created-by';
import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { normalizeSlackRequestText } from 'src/logic-functions/utils/normalize-slack-request-text';
import { resolveSlackBotUserIdOrThrow } from 'src/logic-functions/utils/resolve-slack-bot-user-id-or-throw';
import { resolveSlackRunAsWorkspaceMemberId } from 'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id';

const APPLICATION_ACTOR_SOURCE = 'APPLICATION';

export const resolveSlackRunAsForRequest = async ({
  client,
  identity,
  requestId,
  requestText,
  requestMessage,
}: {
  client: CoreApiClient;
  identity: SlackUserIdentity | undefined;
  requestId: string;
  requestText: string;
  requestMessage: SlackThreadMessage | undefined;
}): Promise<string | undefined> => {
  if (
    !isDefined(identity) ||
    !isDefined(requestMessage) ||
    requestMessage.user !== identity.slackUserId
  ) {
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

  const botUserId = await resolveSlackBotUserIdOrThrow().catch(() => undefined);

  const normalize = (text: string) =>
    normalizeSlackRequestText({ text, botUserId });

  if (normalize(requestMessage.text ?? '') !== normalize(requestText)) {
    return undefined;
  }

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return undefined;
  }

  return await resolveSlackRunAsWorkspaceMemberId({
    client,
    slackClient: slackClientResult.client,
    identity,
  });
};
