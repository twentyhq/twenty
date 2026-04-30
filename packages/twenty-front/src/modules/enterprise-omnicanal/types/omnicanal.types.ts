export type ChannelType = 'email' | 'sms' | 'whatsapp' | 'chat' | 'social' | 'phone';

export type ConversationStatus = 'active' | 'waiting' | 'resolved' | 'snoozed';

export type ConversationData = {
  id: string;
  contactName: string;
  channel: ChannelType;
  subject: string;
  lastMessage: string;
  status: ConversationStatus;
  assignee: string;
  updatedAt: string;
  unreadCount: number;
};

export type MessageData = {
  id: string;
  author: string;
  content: string;
  channel: ChannelType;
  direction: 'inbound' | 'outbound';
  timestamp: string;
};

export type SequenceStepData = {
  id: string;
  order: number;
  channel: ChannelType;
  delayDays: number;
  subject: string;
  templateName: string;
  isActive: boolean;
};
