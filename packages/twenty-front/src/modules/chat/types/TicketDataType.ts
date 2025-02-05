import { ITimeline, statusEnum } from '@/chat/types/WhatsappDocument';

export type TicketDataType = {
  name: string;
  phone?: string;
  email?: string;
  status: statusEnum;
  timeline: ITimeline[];
  sector?: string;
};
