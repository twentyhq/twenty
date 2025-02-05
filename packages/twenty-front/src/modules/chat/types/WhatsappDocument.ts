import { TDateFirestore } from '@/chat/internal/types/chat';

export type WhatsappDocument = {
  integrationId: string;
  agent?: string;
  sector?: string;
  client: IClient;
  messages: IMessage[];
  status: statusEnum;
  lastMessage: IMessage;
  timeline: ITimeline[];
  unreadMessages: number;
  isVisible: boolean;
};

export interface IClient {
  phone?: string;
  name?: string;
}

export enum statusEnum {
  Resolved = 'Resolved',
  InProgress = 'InProgress',
  Waiting = 'Waiting',
  OnHold = 'OnHold',
  Pending = 'Pending',
}

export enum ChatStatus {
  Mine = 'mine',
  Unassigned = 'unassigned',
  Abandoned = 'abandoned',
}

export interface IMessage {
  from: string;
  message: string;
  createdAt: TDateFirestore;
  type: string;
}

export interface ITimeline {
  agent: string | undefined;
  date: TDateFirestore;
  event: string;
  transferTo?: string;
}
