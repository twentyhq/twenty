import { type AgentChatUnconfirmedFirstMessage } from '@/ai/types/AgentChatUnconfirmedFirstMessage';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatUnconfirmedFirstMessageFamilyState =
  createAtomFamilyState<AgentChatUnconfirmedFirstMessage | null, string>({
    key: 'ai/agentChatUnconfirmedFirstMessageFamilyState',
    defaultValue: null,
    useSessionStorage: true,
  });
