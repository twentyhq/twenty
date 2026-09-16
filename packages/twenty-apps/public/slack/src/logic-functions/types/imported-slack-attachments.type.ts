import { type SlackAssistantAttachment } from 'src/logic-functions/types/slack-assistant-attachment.type';
import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';

export type ImportedSlackAttachments = {
  attachments: SlackAssistantAttachment[];
  attachedFileNames: string[];
  // the files these came from, so the prompt can tell them apart from the ones
  // it only knows by name, which two files can share
  attachedSourceFiles: SlackMessageFile[];
};
