import { type SlackAssistantAttachment } from 'src/logic-functions/types/slack-assistant-attachment.type';
import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';

export type ImportedSlackAttachments = {
  attachments: SlackAssistantAttachment[];
  attachedFileNames: string[];
  attachedSourceFiles: SlackMessageFile[];
};
