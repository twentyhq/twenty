import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai-chat/constants/AiChatNewThreadDefaultRecipients';
import { type AiChatNewThreadRecipients } from '@/ai-chat/types/AiChatNewThreadRecipients';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatComposerNewThreadRecipientsFamilyState =
  createAtomFamilyState<AiChatNewThreadRecipients, string>({
    key: 'aiChatComposerNewThreadRecipientsFamilyState',
    defaultValue: AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
    useSessionStorage: true,
  });
