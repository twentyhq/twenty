import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatMessageReactionsRevisionFamilyState =
  createAtomFamilyState<number | null, { messageId: string }>({
    key: 'agentChatMessageReactionsRevisionFamilyState',
    defaultValue: null,
  });
