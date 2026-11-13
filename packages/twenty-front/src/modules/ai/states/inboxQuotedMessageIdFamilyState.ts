import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const inboxQuotedMessageIdFamilyState = createAtomFamilyState<
  string | null,
  { threadId: string | null }
>({
  key: 'inboxQuotedMessageIdFamilyState',
  defaultValue: null,
});
