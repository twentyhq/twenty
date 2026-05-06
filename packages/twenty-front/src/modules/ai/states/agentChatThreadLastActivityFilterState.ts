import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER } from '@/ai/constants/AgentChatThreadLastActivityFilter';
import { type AgentChatThreadLastActivityFilter } from '@/ai/types/AgentChatThreadLastActivityFilter';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatThreadLastActivityFilterState =
  createAtomState<AgentChatThreadLastActivityFilter>({
    key: 'agentChatThreadLastActivityFilterState',
    defaultValue: AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.ALL,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
  });
