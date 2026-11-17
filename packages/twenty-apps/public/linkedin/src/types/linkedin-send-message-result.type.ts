import { type SendAppMessageResult } from 'twenty-sdk/logic-function';

// The published twenty-sdk does not type the attachment report yet
export type LinkedinSendMessageResult = SendAppMessageResult & {
  splitAttachments?: { attachmentIndex: number; externalId: string }[];
  rejectedAttachmentIndexes?: number[];
};
