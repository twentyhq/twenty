import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type AgentChatThreadRecord = ObjectRecord & {
  title: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string | null;
  lastMessageText?: string | null;
  lastMessageSenderWorkspaceMemberId?: string | null;
  writerWorkspaceMemberIds?: string[] | null;
  workspaceMemberId?: string | null;
  totalInputTokens?: number;
  totalOutputTokens?: number;
  totalCacheReadTokens?: number;
  contextWindowTokens?: number | null;
  conversationSize?: number;
  totalInputCredits?: number | string;
  totalOutputCredits?: number | string;
};
