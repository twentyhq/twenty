import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { createState } from '@/ui/utilities/state/utils/createState';

export const currentWorkspaceMembersState = createState<
  PartialWorkspaceMember[]
>({
  key: 'currentWorkspaceMembersState',
  defaultValue: [],
});
