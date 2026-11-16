import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatIsAwaitingFirstChunkFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string | null }
>({
  key: 'aiChatIsAwaitingFirstChunkFamilyState',
  defaultValue: false,
});
