import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatThreadReplyIsSendingFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string }
>({
  key: 'aiChatThreadReplyIsSendingFamilyState',
  defaultValue: false,
});
