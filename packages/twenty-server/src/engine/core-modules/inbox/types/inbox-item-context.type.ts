// Where an item came from. Provenance only: what the item is about lives in
// inboxItemRecord rows, and its one line of text is a column on the item.
// Versioned because producers write this with no schema behind them, so a
// reader has to know which shape it is looking at.
export const INBOX_ITEM_CONTEXT_VERSION = 1;

export type InboxItemProducer =
  | 'agentChat'
  | 'workflowRun'
  | 'inboxTool'
  | 'seed';

export type InboxItemContextSource = {
  kind: 'email' | 'thread' | 'record' | 'call';
  label: string;
  detail?: string;
  excerpt?: string;
  messageCount?: number;
};

export type InboxItemContext = {
  version: typeof INBOX_ITEM_CONTEXT_VERSION;
  producer: InboxItemProducer;
  source?: InboxItemContextSource;
};
