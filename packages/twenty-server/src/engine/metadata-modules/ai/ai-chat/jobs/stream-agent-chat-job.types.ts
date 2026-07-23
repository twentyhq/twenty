import type {
  ExtendedUIMessage,
  ExtendedUIMessagePart,
} from 'twenty-shared/ai';

import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import type { BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsingContext.type';

export type StreamAgentChatJobData = {
  threadId: string;
  streamId: string;
  userWorkspaceId: string;
  workspaceId: string;
  messages: ExtendedUIMessage[];
  browsingContext: BrowsingContextType | null;
  companyContext: WorkspaceCompanyEnrichment | null;
  modelId?: string;
  lastUserMessageText: string;
  lastUserMessageParts: ExtendedUIMessagePart[];
  hasTitle: boolean;
  existingTurnId?: string;
  conversationSizeTokens: number;
  isResume?: boolean;
};
