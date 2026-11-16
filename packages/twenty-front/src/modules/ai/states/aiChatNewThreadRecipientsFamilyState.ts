import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AiChatNewThreadDefaultRecipients';
import { type AiChatNewThreadRecipients } from '@/ai/types/AiChatNewThreadRecipients';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatNewThreadRecipientsFamilyState = createAtomFamilyState<
  AiChatNewThreadRecipients,
  string
>({
  key: 'ai/agentChatNewThreadRecipientsFamilyState',
  defaultValue: AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
  useSessionStorage: true,
});
