export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketChannel = 'email' | 'phone' | 'chat' | 'portal' | 'social';

export type TicketCategory = 'billing' | 'technical' | 'general' | 'feature_request' | 'bug';

export type TicketComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
};

export type TicketData = {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  channel: TicketChannel;
  assignee: string;
  requester: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  comments: TicketComment[];
  linkedDealId?: string;
};
