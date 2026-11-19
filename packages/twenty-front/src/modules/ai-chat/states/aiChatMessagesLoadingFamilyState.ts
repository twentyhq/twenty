import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatMessagesLoadingFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string }
>({
  key: 'aiChatMessagesLoadingFamilyState',
  defaultValue: false,
});
