import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatQuotedMessageIdFamilyState = createAtomFamilyState<
  string | null,
  { threadId: string | null }
>({
  key: 'aiChatQuotedMessageIdFamilyState',
  defaultValue: null,
});
