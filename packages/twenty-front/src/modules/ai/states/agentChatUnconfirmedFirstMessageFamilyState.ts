import { type AiChatUnconfirmedFirstMessage } from '@/ai/types/AgentChatUnconfirmedFirstMessage';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatUnconfirmedFirstMessageFamilyState = createAtomFamilyState<
  AiChatUnconfirmedFirstMessage | null,
  string
>({
  key: 'ai/agentChatUnconfirmedFirstMessageFamilyState',
  defaultValue: null,
  useSessionStorage: true,
});
