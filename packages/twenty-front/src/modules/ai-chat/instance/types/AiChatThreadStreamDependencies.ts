import { type ApolloClient } from '@apollo/client';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

export type AiChatThreadStreamDependencies = {
  apolloClient: ApolloClient;
  applyAiChatThreadUpdate: (
    update: Partial<AiChatThreadRecord> & { id: string },
  ) => void;
  loadAiChatThread: (
    threadId: string,
  ) => Promise<AiChatThreadRecord | null | undefined>;
  refreshAiChatThreadPermissions: (threadIds: string[]) => Promise<void>;
  refreshAiChatUsage: () => void;
};
