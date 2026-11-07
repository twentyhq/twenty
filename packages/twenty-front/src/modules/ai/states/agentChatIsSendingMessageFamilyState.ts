import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatIsSendingMessageFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string }
>({
  key: 'agentChatIsSendingMessageFamilyState',
  defaultValue: false,
});
