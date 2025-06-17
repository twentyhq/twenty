import { statusEnum } from 'src/engine/core-modules/meta/types/statusEnum';

export type WhatsappDocument = {
  integrationId: string;
  workspaceId?: string;
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

type IClient = {
  phone: string;
  name?: string;
};

type IMessage = {
  from: string;
  message: string;
  createdAt: Date;
  type: string;
};

type ITimeline = {
  agent: string;
  date: Date;
  event: string;
  transferTo?: string;
};
