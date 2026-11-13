import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const aiChatMessagesFamilyState = createAtomFamilyState<
  ExtendedUIMessage[],
  { threadId: string | null }
>({
  key: 'aiChatMessagesFamilyState',
  defaultValue: [],
});
