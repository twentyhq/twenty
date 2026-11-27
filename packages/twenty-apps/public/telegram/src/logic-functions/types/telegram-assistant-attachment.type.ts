import { type RunAgentInput } from 'twenty-sdk/logic-function';

type TelegramAssistantAgentMessage = Exclude<
  NonNullable<RunAgentInput['input']>,
  string
>[number];

export type TelegramAssistantAttachment = NonNullable<
  TelegramAssistantAgentMessage['attachments']
>[number];
