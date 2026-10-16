import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatLiveReactionRevisionsFamilyState = createAtomFamilyState<
  Record<string, number>,
  { threadId: string | null }
>({
  key: 'agentChatLiveReactionRevisionsFamilyState',
  defaultValue: {},
});
