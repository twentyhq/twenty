import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const currentWorkspaceMembersState = createStateV2<
  PartialWorkspaceMember[]
>({
  key: 'currentWorkspaceMembersState',
  defaultValue: [],
});
