import { type AiChatUnconfirmedFirstMessage } from '@/ai-chat/types/AiChatUnconfirmedFirstMessage';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatThreadReplyUnconfirmedFirstMessageFamilyState =
  createAtomFamilyState<AiChatUnconfirmedFirstMessage | null, string>({
    key: 'aiChatThreadReplyUnconfirmedFirstMessageFamilyState',
    defaultValue: null,
    useSessionStorage: true,
  });
