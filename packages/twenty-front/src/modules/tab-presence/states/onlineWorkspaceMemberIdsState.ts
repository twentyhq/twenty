import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const onlineWorkspaceMemberIdsState = createAtomState<string[] | null>({
  key: 'tab-presence/onlineWorkspaceMemberIdsState',
  defaultValue: null,
});
