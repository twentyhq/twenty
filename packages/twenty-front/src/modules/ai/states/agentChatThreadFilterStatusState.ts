import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatThreadFilterStatusState =
  createAtomState<AgentChatThreadFilterStatus>({
    key: 'agentChatThreadFilterStatusState',
    defaultValue: AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
  });
