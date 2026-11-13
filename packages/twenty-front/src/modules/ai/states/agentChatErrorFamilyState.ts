import { type AiChatError } from '@/ai/types/AiChatError';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatErrorFamilyState = createAtomFamilyState<
  AiChatError | null,
  { threadId: string | null }
>({
  key: 'aiChatErrorFamilyState',
  defaultValue: null,
});
