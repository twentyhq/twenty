import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatMessageReactionRevisionsFamilyState = createAtomFamilyState<
  Record<string, number>,
  { threadId: string | null }
>({
  key: 'aiChatMessageReactionRevisionsFamilyState',
  defaultValue: {},
});
