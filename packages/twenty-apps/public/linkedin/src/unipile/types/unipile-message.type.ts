import { type UnipileMessageAttachment } from 'src/unipile/types/unipile-message-attachment.type';
import { type UnipileProvider } from 'src/unipile/types/unipile-provider.type';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export type UnipileMessage = {
  id: string;
  chat_id: string;
  sender_id: string;
  sender?: UnipileUser;
  text?: string;
  timestamp: string;
  is_sender: boolean;
  is_deleted: boolean;
  is_event: boolean;
  // left out of some webhook payloads, so a missing flag reads as not yet
  is_seen?: boolean;
  is_delivered?: boolean;
  provider: UnipileProvider;
  attachments?: UnipileMessageAttachment[];
};
