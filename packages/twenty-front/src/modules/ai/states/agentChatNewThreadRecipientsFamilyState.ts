import { AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AgentChatNewThreadDefaultRecipients';
import { type AgentChatNewThreadRecipients } from '@/ai/types/AgentChatNewThreadRecipients';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatNewThreadRecipientsFamilyState = createAtomFamilyState<
  AgentChatNewThreadRecipients,
  string
>({
  key: 'ai/agentChatNewThreadRecipientsFamilyState',
  defaultValue: AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
  useSessionStorage: true,
});
