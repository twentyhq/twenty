import { type ApolloClient } from '@apollo/client';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { type AiChatThreadUpdate } from '@/ai-chat/threads/types/AiChatThreadUpdate';

export type AiChatThreadStreamDependencies = {
  apolloClient: ApolloClient;
  applyAiChatThreadUpdate: (update: AiChatThreadUpdate) => void;
  loadAiChatThread: (
    threadId: string,
  ) => Promise<AiChatThreadRecord | null | undefined>;
  refreshAiChatThreadPermissions: (threadIds: string[]) => Promise<void>;
  refreshAiChatUsage: () => void;
};
