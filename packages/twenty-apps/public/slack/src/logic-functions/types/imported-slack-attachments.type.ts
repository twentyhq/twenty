import { type SlackAssistantAttachment } from 'src/logic-functions/types/slack-assistant-attachment.type';

export type ImportedSlackAttachments = {
  attachments: SlackAssistantAttachment[];
  attachedFileNames: string[];
};
