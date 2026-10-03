import type { BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';

export type StreamAgentChatJobData = {
  threadId: string;
  streamId: string;
  userWorkspaceId: string;
  workspaceId: string;
  browsingContext: BrowsingContextType | null;
  modelId?: string;
  hasTitle: boolean;
  existingTurnId?: string;
  // Absent only on jobs queued before sender attribution was deployed.
  messageId?: string;
  conversationSizeTokens: number;
};
