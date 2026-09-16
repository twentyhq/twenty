import { type SlackAssistantAttachment } from 'src/logic-functions/types/slack-assistant-attachment.type';

export type ImportedSlackAttachments = {
  attachments: SlackAssistantAttachment[];
  attachedFileNames: string[];
  // A stub is named only once files.info resolves it, so the prompt's file list
  // still carries the placeholder name the same file arrived with
  supersededFileNames: string[];
};
