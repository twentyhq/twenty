import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatLiveReactionRevisionsFamilyState = createAtomFamilyState<
  Record<string, number>,
  { threadId: string | null }
>({
  key: 'aiChatLiveReactionRevisionsFamilyState',
  defaultValue: {},
});
