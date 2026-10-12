import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatIsAwaitingPersistedRefetchFamilyState =
  createAtomFamilyState<boolean, { threadId: string | null }>({
    key: 'agentChatIsAwaitingPersistedRefetchFamilyState',
    defaultValue: false,
  });
