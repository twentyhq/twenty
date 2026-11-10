import { type SendAppMessagePayload } from 'twenty-sdk/logic-function';

export type LinkedinSendMessageAttachment = {
  filename: string;
  mimeType: string;
  size: number;
  url: string;
};

// TODO: use SendAppMessagePayload alone once twenty-sdk ships its attachments
export type LinkedinSendMessagePayload = SendAppMessagePayload & {
  attachments?: LinkedinSendMessageAttachment[];
};
