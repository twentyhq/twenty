import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// Revisions of the reactions received live since the thread was subscribed, by message id
export const agentChatLiveReactionRevisionsFamilyState = createAtomFamilyState<
  Record<string, number>,
  { threadId: string | null }
>({
  key: 'agentChatLiveReactionRevisionsFamilyState',
  defaultValue: {},
});
