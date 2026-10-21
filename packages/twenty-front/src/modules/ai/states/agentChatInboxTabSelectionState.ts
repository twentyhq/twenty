import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatInboxTabSelection = {
  filterStatus: AgentChatThreadFilterStatus;
  selectedThreadIds: string[];
  excludedThreadIds: string[];
};

// Set while the selection covers every chat of a tab, loaded or not
export const agentChatInboxTabSelectionState =
  createAtomState<AgentChatInboxTabSelection | null>({
    key: 'agentChatInboxTabSelectionState',
    defaultValue: null,
  });
