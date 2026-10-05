import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';

export type SlackAssistantAttachment = NonNullable<
  SlackAssistantAgentMessage['attachments']
>[number];
