import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type BrowsingContext } from '@/ai/types/BrowsingContext';

export const aiChatLastSentBrowsingContextFamilyState = createAtomFamilyState<
  BrowsingContext | null | undefined,
  string
>({
  key: 'ai/aiChatLastSentBrowsingContextFamilyState',
  defaultValue: undefined,
});
