import { type SlackMessageReference } from 'src/logic-functions/types/slack-message-reference.type';

export type SlackAssistantEmptyRequest = SlackMessageReference & {
  parentMessageTimestamp: string | undefined;
  isInExistingThread: boolean;
};
