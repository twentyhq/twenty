import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_REQUEST_OUTCOME_LOOKUP_TIMEOUT_MS } from 'src/logic-functions/constants/slack-assistant-request-outcome-lookup-timeout-ms';
import { findSlackAssistantRequestOutcomesBySlackMessages } from 'src/logic-functions/data/find-slack-assistant-request-outcomes-by-slack-messages';
import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';
import { buildSlackConversationMessages } from 'src/logic-functions/utils/build-slack-conversation-messages';
import { runWithTimeout } from 'src/logic-functions/utils/run-with-timeout';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const resolveSlackConversationMessages = async ({
  client,
  slackChannelId,
  parentMessageTimestamp,
  conversationThreadMessages,
  assistantBotUserId,
}: {
  client: CoreApiClient;
  slackChannelId: string;
  parentMessageTimestamp: string;
  conversationThreadMessages: ReadonlyArray<SlackThreadMessage>;
  assistantBotUserId: string | undefined;
}): Promise<SlackAssistantAgentMessage[]> => {
  const requestOutcomeByMessageTimestamp = await runWithTimeout({
    operation: findSlackAssistantRequestOutcomesBySlackMessages(client, {
      slackChannelId,
      slackMessageTimestamps: conversationThreadMessages
        .map((message) => message.ts)
        .filter(isNonEmptyString),
    }).catch((error) => {
      console.warn(
        `[slack] failed to read the request outcomes of thread ${parentMessageTimestamp} in ${slackChannelId}, answering without Slack context: ${toErrorMessage(error)}`,
      );

      return undefined;
    }),
    timeoutMs: SLACK_ASSISTANT_REQUEST_OUTCOME_LOOKUP_TIMEOUT_MS,
    buildTimeoutValue: () => {
      console.warn(
        `[slack] reading the request outcomes of thread ${parentMessageTimestamp} in ${slackChannelId} timed out, answering without Slack context`,
      );

      return undefined;
    },
  });

  if (!isDefined(requestOutcomeByMessageTimestamp)) {
    return [];
  }

  return buildSlackConversationMessages({
    messages: conversationThreadMessages,
    assistantBotUserId,
    requestOutcomeByMessageTimestamp,
  });
};
