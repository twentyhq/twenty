import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

// Until the saved role is loaded and copied into the draft, the draft holds
// the empty default role, and auto-saving it would wipe the role's permissions
export const isCoreAgentRoleDirty = ({
  roleId,
  draftRole,
  persistedRole,
}: {
  roleId: string | null | undefined;
  draftRole: RoleWithPartialMembers;
  persistedRole: RoleWithPartialMembers | undefined;
}) =>
  isDefined(roleId) &&
  isDefined(persistedRole) &&
  persistedRole.id === roleId &&
  draftRole.id === roleId &&
  !isDeeplyEqual(draftRole, persistedRole);
