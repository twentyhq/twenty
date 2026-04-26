import {
  AGENT_CHAT_THREAD_GROUP_BY,
  type AgentChatThreadGroupBy,
} from '@/ai/constants/AgentChatThreadGroupBy';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatThreadGroupByState =
  createAtomState<AgentChatThreadGroupBy>({
    key: 'agentChatThreadGroupByState',
    defaultValue: AGENT_CHAT_THREAD_GROUP_BY.DATE,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
  });
