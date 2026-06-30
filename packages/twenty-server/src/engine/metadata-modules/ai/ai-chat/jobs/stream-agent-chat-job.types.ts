import type {
  ExtendedUIMessage,
  ExtendedUIMessagePart,
} from 'twenty-shared/ai';

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
  lastUserMessageParts: ExtendedUIMessagePart[];
  hasTitle: boolean;
  existingTurnId?: string;
  conversationSizeTokens: number;
  // Resuming a turn after the user answered an `ask_questions` pause. No new
  // user message is persisted, and a second assistant message is allowed within
  // the existing turn (the dedup guard is bypassed).
  isResume?: boolean;
};
