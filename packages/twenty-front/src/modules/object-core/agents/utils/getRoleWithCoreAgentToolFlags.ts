import { TOOL_PERMISSION_FLAGS } from 'twenty-shared/constants';
import { v4 } from 'uuid';

import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const getRoleWithCoreAgentToolFlags = (
  role: RoleWithPartialMembers,
  enabledToolFlags: string[],
): RoleWithPartialMembers => {
  const toolFlags: string[] = [...TOOL_PERMISSION_FLAGS];
  const permissionFlags = role.permissionFlags ?? [];

  return {
    ...role,
    canAccessAllTools:
      role.canAccessAllTools &&
      toolFlags.every((toolFlag) => enabledToolFlags.includes(toolFlag)),
    permissionFlags: [
      ...permissionFlags.filter(
        ({ flag }) =>
          !toolFlags.includes(flag) || enabledToolFlags.includes(flag),
      ),
      ...enabledToolFlags
        .filter(
          (toolFlag) => !permissionFlags.some(({ flag }) => flag === toolFlag),
        )
        .map((toolFlag) => ({ id: v4(), flag: toolFlag, roleId: role.id })),
    ],
  };
};
