import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const inboxTypingWorkspaceMemberIdsFamilyState = createAtomFamilyState<
  string[],
  { threadId: string | null }
>({
  key: 'inboxTypingWorkspaceMemberIdsFamilyState',
  defaultValue: [],
});
