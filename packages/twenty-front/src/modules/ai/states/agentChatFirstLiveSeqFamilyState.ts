import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatFirstLiveSeqFamilyState = createAtomFamilyState<
  number | null,
  { threadId: string | null }
>({
  key: 'agentChatFirstLiveSeqFamilyState',
  defaultValue: null,
});
