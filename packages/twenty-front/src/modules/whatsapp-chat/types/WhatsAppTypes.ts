export interface WaConversation {
  id: string;
  sessionName: string;
  leadPhoneNumber: string;
  whatsappName: string;
  leadFullName?: string;
  lastMessageBody: string;
  lastMessageAt: string;
  lastMessageFromAgent: boolean;
  messageCount?: number;
  isPinned: boolean;
  isUnread?: boolean;
  isArchived: boolean;
  assignedToEmail?: string;
  assignedToName?: string;
  isClient?: boolean;
  // Enriched fields (populated by bridge contact join)
  contactEmail?: string;
  justusProgram?: string;
  justusDuration?: string;
  closeLeadId?: string;
  closeLeadUrl?: string;
  closeLeadStatus?: string;
  coachLeadOwnerEmail?: string;
  coachLeadOwnerName?: string;
  contractIsSigned?: boolean;
  contractSent?: boolean;
  contractViewed?: boolean;
  completedStrukturanalyse?: boolean;
  // MOP (Marketing Offer Participation) summary fields
  mopCount?: number;
  mopTotalWatchTimeMinutes?: number;
  mopFirstSignupDate?: string;
  mopLastActivityDate?: string;
  mopLatestOfferName?: string;
  mopLastCallDate?: string;
  mopLastCallDurationSeconds?: number;
}

export interface WaMessage {
  id: string;
  wahaId: string;
  conversationId: string;
  sessionName: string;
  fromJid?: string;
  toJid?: string;
  fromAgent: boolean;
  body?: string;
  messageTimestamp: string;
  status: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  hasMedia: boolean;
  mediaMimetype?: string;
  mediaUrl?: string;
  source: 'APP' | 'API';
  isEdited?: boolean;
  isDeleted?: boolean;
  tempId?: string;
}

export interface WsEvent {
  type:
    | 'message.new'
    | 'message.status'
    | 'message.edited'
    | 'message.deleted'
    | 'session.status';
  conversation_id?: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface WaLabel {
  id: string;
  name: string;
  color: string;
  conversationId: string;
}

export interface WaSession {
  name: string;
  status: string;
  me?: {
    id: string;
    pushName: string;
  };
}

export interface ConversationsResponse {
  items: WaConversation[];
  cursor?: string;
  hasMore: boolean;
}

export interface MessagesResponse {
  items: WaMessage[];
  cursor?: string;
  hasMore: boolean;
}

export interface SendMessagePayload {
  conversation_id: string;
  session_name: string;
  to_jid: string;
  type: 'text' | 'image' | 'voice';
  body?: string;
  media_base64?: string;
  media_mimetype?: string;
  temp_id: string;
}
