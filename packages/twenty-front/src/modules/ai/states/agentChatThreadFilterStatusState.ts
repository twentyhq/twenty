import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// A new key, as the stored 'archived' used to be the Deleted filter and now
// means the member's archive
export const agentChatThreadFilterStatusState =
  createAtomState<AgentChatThreadFilterStatus>({
    key: 'agentChatThreadInboxFilterStatusState',
    defaultValue: AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
  });
