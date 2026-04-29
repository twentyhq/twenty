import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { type AgentChatThreadGroupBy } from '@/ai/types/AgentChatThreadGroupBy';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatThreadGroupByState =
  createAtomState<AgentChatThreadGroupBy>({
    key: 'agentChatThreadGroupByState',
    defaultValue: AGENT_CHAT_THREAD_GROUP_BY.DATE,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
  });
