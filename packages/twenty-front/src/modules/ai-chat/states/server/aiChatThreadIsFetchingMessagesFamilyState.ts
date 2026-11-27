import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatThreadIsFetchingMessagesFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string }
>({
  key: 'aiChatThreadIsFetchingMessagesFamilyState',
  defaultValue: false,
});
