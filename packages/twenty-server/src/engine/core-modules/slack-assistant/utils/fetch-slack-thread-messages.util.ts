import { isDefined } from 'twenty-shared/utils';

import { type SlackApiResponse } from 'src/engine/core-modules/slack-assistant/types/slack-api-response.type';
import { callSlackApi } from 'src/engine/core-modules/slack-assistant/utils/call-slack-api.util';

type SlackConversationsRepliesResponse = SlackApiResponse & {
  messages?: {
    ts?: string;
    text?: string;
    bot_id?: string;
  }[];
};

export type SlackThreadMessage = {
  ts: string;
  text: string;
  isBot: boolean;
};

export const fetchSlackThreadMessages = async ({
  token,
  channel,
  threadTs,
  limit,
}: {
  token: string;
  channel: string;
  threadTs: string;
  limit: number;
}): Promise<SlackThreadMessage[]> => {
  const response = await callSlackApi<SlackConversationsRepliesResponse>(
    'conversations.replies',
    {
      channel,
      ts: threadTs,
      limit,
    },
    token,
  );

  if (response.ok !== true || !isDefined(response.messages)) {
    throw new Error(
      `Slack conversations.replies failed: ${response.error ?? 'unknown_error'}`,
    );
  }

  return response.messages
    .filter((message) => isDefined(message.ts))
    .map((message) => ({
      ts: message.ts as string,
      text: message.text ?? '',
      isBot: isDefined(message.bot_id),
    }));
};
