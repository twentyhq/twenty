import { type IngestMessageAttachment } from 'twenty-sdk/logic-function';

export type WhatsappMessageAttachments = {
  messageExternalId: string;
  attachments: IngestMessageAttachment[];
};
