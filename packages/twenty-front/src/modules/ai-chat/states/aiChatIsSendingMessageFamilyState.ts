import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatIsSendingMessageFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string }
>({
  key: 'aiChatIsSendingMessageFamilyState',
  defaultValue: false,
});
