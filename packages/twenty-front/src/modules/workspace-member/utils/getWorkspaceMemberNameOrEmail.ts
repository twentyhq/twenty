import { isNonEmptyString } from '@sniptt/guards';

import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export const getWorkspaceMemberNameOrEmail = (
  workspaceMember: Pick<PartialWorkspaceMember, 'name' | 'userEmail'>,
): string => {
  const fullName =
    `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim();

  return isNonEmptyString(fullName) ? fullName : workspaceMember.userEmail;
};
