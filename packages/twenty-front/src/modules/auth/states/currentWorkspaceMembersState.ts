import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { createState } from 'twenty-ui/utilities';

export const currentWorkspaceMembersState = createState<
  PartialWorkspaceMember[]
>({
  key: 'currentWorkspaceMembersState',
  defaultValue: [],
});
