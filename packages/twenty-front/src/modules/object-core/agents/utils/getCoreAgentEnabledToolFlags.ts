import { TOOL_PERMISSION_FLAGS } from 'twenty-shared/constants';

import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const getCoreAgentEnabledToolFlags = (
  role: RoleWithPartialMembers | undefined,
): string[] => {
  const toolFlags: string[] = [...TOOL_PERMISSION_FLAGS];

  if (role?.canAccessAllTools === true) {
    return toolFlags;
  }

  return (role?.permissionFlags ?? [])
    .map(({ flag }) => flag)
    .filter((flag) => toolFlags.includes(flag));
};
