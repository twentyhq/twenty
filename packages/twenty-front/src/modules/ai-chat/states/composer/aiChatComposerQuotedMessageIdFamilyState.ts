import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatComposerQuotedMessageIdFamilyState = createAtomFamilyState<
  string | null,
  { threadId: string | null }
>({
  key: 'aiChatComposerQuotedMessageIdFamilyState',
  defaultValue: null,
});
