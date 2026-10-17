import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatInboxTabSelection = {
  filterStatus: AgentChatThreadFilterStatus;
  selectedThreadIds: string[];
  excludedThreadIds: string[];
};

// Set while the inbox selection covers every chat of a tab, past the loaded
// ones, so inbox actions on that selection apply to the whole tab
export const agentChatInboxTabSelectionState =
  createAtomState<AgentChatInboxTabSelection | null>({
    key: 'agentChatInboxTabSelectionState',
    defaultValue: null,
  });
