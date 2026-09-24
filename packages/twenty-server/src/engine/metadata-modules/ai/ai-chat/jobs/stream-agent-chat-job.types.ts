import type { ExtendedUIMessage } from 'twenty-shared/ai';

import type { BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';

export type StreamAgentChatJobData = {
  threadId: string;
  streamId: string;
  userWorkspaceId: string;
  workspaceId: string;
  messages: ExtendedUIMessage[];
  browsingContext: BrowsingContextType | null;
  modelId?: string;
  lastUserMessageText: string;
  hasTitle: boolean;
  existingTurnId?: string;
  // Absent only on jobs queued before sender attribution was deployed.
  messageId?: string;
  conversationSizeTokens: number;
};
