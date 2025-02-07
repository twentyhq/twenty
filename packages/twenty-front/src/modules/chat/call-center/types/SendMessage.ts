import { MessageType } from '@/chat/types/MessageType';

export interface SendMessageInput {
  integrationId: string;
  to: string;
  message?: string;
  type: MessageType;
  fieldId?: string;
}

export interface SendEventMessageInput extends SendMessageInput {
  eventStatus: MessageType;
  status: string;
  from: string;
  agent?: {
    name?: string;
    id?: string;
  };
  sector?: {
    name?: string;
    id?: string;
  };
}
