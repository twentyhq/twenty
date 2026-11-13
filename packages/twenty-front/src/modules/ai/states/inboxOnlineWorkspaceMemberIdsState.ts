import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const inboxOnlineWorkspaceMemberIdsState = createAtomState<
  string[] | null
>({
  key: 'ai/inboxOnlineWorkspaceMemberIdsState',
  defaultValue: null,
});
