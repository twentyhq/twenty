import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentWorkspaceMembersState = createAtomState<
  PartialWorkspaceMember[]
>({
  key: 'currentWorkspaceMembersState',
  defaultValue: [],
});
