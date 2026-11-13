import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const inboxIsSendingMessageFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string }
>({
  key: 'inboxIsSendingMessageFamilyState',
  defaultValue: false,
});
