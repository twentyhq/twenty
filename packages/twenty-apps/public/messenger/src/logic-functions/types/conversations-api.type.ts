// reference: https://developers.facebook.com/docs/messenger-platform/conversations
export type ConversationsApiParticipant = { id: string; name?: string };

export type ConversationsApiConversationList = {
  data: { id: string; updated_time: string }[];
  paging?: { cursors?: { after?: string }; next?: string };
};

export type ConversationsApiMessageIds = {
  messages?: { data: { id: string; created_time: string }[] };
};

export type ConversationsApiMessage = {
  id: string;
  created_time: string;
  from: ConversationsApiParticipant;
  to: { data: ConversationsApiParticipant[] };
  message?: string;
};

export type BackfillConversationsPayload = {
  pageId: string;
  backfillRunId: string;
  after?: string;
};

export type ImportConversationPayload = {
  pageId: string;
  backfillRunId: string;
  conversationId: string;
};
