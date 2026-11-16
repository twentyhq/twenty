import { type SendMessageData } from '@unipile/sdk';

export type UnipileOutgoingAttachment = NonNullable<
  SendMessageData['body']['attachments']
>[number];
