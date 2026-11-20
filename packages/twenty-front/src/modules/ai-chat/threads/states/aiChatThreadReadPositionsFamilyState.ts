import { type AiChatThreadReadPosition } from '@/ai-chat/threads/types/AiChatThreadReadPosition';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatThreadReadPositionsFamilyState = createAtomFamilyState<
  AiChatThreadReadPosition[] | null,
  { threadId: string | null }
>({
  key: 'aiChatThreadReadPositionsFamilyState',
  defaultValue: null,
});
