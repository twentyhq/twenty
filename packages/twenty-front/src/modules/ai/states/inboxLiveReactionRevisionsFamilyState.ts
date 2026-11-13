import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const inboxLiveReactionRevisionsFamilyState = createAtomFamilyState<
  Record<string, number>,
  { threadId: string | null }
>({
  key: 'inboxLiveReactionRevisionsFamilyState',
  defaultValue: {},
});
