import { createContext, useContext } from 'react';

export type AgentChatContextValue = {
  ensureThreadForDraft: (() => void) | undefined;
  threadsLoading: boolean;
  messagesLoading: boolean;
  skipMessagesSkeleton: boolean;
  focusEditorAfterMigrate: boolean;
  setFocusEditorAfterMigrate: (value: boolean) => void;
  threadIdCreatedFromDraft: string | null;
  setThreadIdCreatedFromDraft: (value: string | null) => void;
};

export const AgentChatContext = createContext<AgentChatContextValue>({
  ensureThreadForDraft: undefined,
  threadsLoading: false,
  messagesLoading: false,
  skipMessagesSkeleton: false,
  focusEditorAfterMigrate: false,
  setFocusEditorAfterMigrate: () => {},
  threadIdCreatedFromDraft: null,
  setThreadIdCreatedFromDraft: () => {},
});

export const useAgentChatContext = () => useContext(AgentChatContext);
