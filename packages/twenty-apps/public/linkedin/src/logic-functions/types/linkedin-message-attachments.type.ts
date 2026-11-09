import { type IngestMessageAttachment } from 'twenty-sdk/logic-function';

export type LinkedinMessageAttachments = {
  messageExternalId: string;
  attachments: IngestMessageAttachment[];
};
