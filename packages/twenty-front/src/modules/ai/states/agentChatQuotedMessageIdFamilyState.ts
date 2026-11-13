import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatQuotedMessageIdFamilyState = createAtomFamilyState<
  string | null,
  { threadId: string | null }
>({
  key: 'agentChatQuotedMessageIdFamilyState',
  defaultValue: null,
});
