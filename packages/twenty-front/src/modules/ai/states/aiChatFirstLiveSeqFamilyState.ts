import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatFirstLiveSeqFamilyState = createAtomFamilyState<
  number | null,
  { threadId: string | null }
>({
  key: 'aiChatFirstLiveSeqFamilyState',
  defaultValue: null,
});
