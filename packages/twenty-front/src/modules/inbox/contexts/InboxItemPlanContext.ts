import { createContext } from 'react';

import {
  type InboxItem,
  type InboxItemField,
  type InboxItemToolCall,
} from '~/generated/graphql';

export type InboxItemToolCallDraft = {
  toolName: string;
  label: string;
  icon: string;
  inputSchema?: Omit<InboxItemField, '__typename'>[];
  proposedInput: Record<string, unknown>;
};

// Everything the pane's slots and footer need to draw and drive one item's
// plan. Held in one place so no layout has to thread it down or own it twice.
export type InboxItemPlanContextValue = {
  inboxItem: InboxItem;
  messageThreadId: string | null;
  isDone: boolean;
  // A run or a save is on the wire, or a save failed and the editor still
  // shows what the server never got. Nothing runs until it clears.
  isBusy: boolean;
  featuredToolCall: InboxItemToolCall | null;
  otherToolCalls: InboxItemToolCall[];
  pendingToolCallCount: number;
  otherPendingToolCallCount: number;
  runAll: () => Promise<void>;
  runToolCall: (toolCallId: string) => Promise<void>;
  createToolCall: (draft: InboxItemToolCallDraft) => Promise<void>;
  saveToolCallInput: (
    toolCallId: string,
    editedInput: Record<string, unknown>,
  ) => Promise<void>;
  setToolCallRejected: (
    toolCallId: string,
    isRejected: boolean,
  ) => Promise<void>;
  registerFlush: (
    toolCallId: string,
    flush: (() => Promise<void>) | null,
  ) => void;
  archiveItem: () => void;
  reopenItem: () => void;
};

export const InboxItemPlanContext = createContext<
  InboxItemPlanContextValue | undefined
>(undefined);
