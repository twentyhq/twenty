import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatThreadReplyRecoveryAttemptsFamilyState =
  createAtomFamilyState<number, { threadId: string | null }>({
    key: 'aiChatThreadReplyRecoveryAttemptsFamilyState',
    defaultValue: 0,
  });
