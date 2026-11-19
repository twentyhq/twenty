import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatTypingWorkspaceMemberIdsFamilyState = createAtomFamilyState<
  string[],
  { threadId: string | null }
>({
  key: 'aiChatTypingWorkspaceMemberIdsFamilyState',
  defaultValue: [],
});
