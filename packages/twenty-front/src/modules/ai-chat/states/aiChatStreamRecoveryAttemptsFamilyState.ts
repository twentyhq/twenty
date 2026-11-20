import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatStreamRecoveryAttemptsFamilyState = createAtomFamilyState<
  number,
  { threadId: string | null }
>({
  key: 'aiChatStreamRecoveryAttemptsFamilyState',
  defaultValue: 0,
});
