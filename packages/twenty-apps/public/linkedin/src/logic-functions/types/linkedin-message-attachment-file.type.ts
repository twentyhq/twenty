import { type UnipileMessageAttachment } from 'src/unipile/types/unipile-message-attachment.type';

export type LinkedinMessageAttachmentFile = {
  messageExternalId: string;
  attachmentId: string;
  type: UnipileMessageAttachment['type'];
  mimeType: string;
  content: Buffer;
};
