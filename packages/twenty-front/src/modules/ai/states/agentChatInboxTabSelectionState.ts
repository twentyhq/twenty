import { type AgentChatInboxTabSelection } from '@/ai/types/AgentChatInboxTabSelection';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Set while the selection covers every chat of a tab, loaded or not
export const agentChatInboxTabSelectionState =
  createAtomState<AgentChatInboxTabSelection | null>({
    key: 'agentChatInboxTabSelectionState',
    defaultValue: null,
  });
