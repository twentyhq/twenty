import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatIsAwaitingFirstChunkFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string | null }
>({
  key: 'agentChatIsAwaitingFirstChunkFamilyState',
  defaultValue: false,
});
