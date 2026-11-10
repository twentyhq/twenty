import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatTypingWorkspaceMemberIdsFamilyState =
  createAtomFamilyState<string[], { threadId: string | null }>({
    key: 'agentChatTypingWorkspaceMemberIdsFamilyState',
    defaultValue: [],
  });
