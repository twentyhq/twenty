import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const updateCoreAgentToolAccess = ({
  role,
  toolKey,
  isEnabled,
  availableToolKeys,
  createPermissionId,
}: {
  role: RoleWithPartialMembers;
  toolKey: string;
  isEnabled: boolean;
  availableToolKeys: string[];
  createPermissionId: () => string;
}): RoleWithPartialMembers => {
  const availableKeys = new Set(availableToolKeys);
  const currentFlags = role.permissionFlags ?? [];
  const hasFlag = currentFlags.some(({ flag }) => flag === toolKey);

  if (
    !availableKeys.has(toolKey) ||
    (isEnabled && (role.canAccessAllTools || hasFlag))
  ) {
    return role;
  }

  const retainedFlags = currentFlags.filter(({ flag }) => flag !== toolKey);
  const retainedKeys = new Set(retainedFlags.map(({ flag }) => flag));
  const flagsToAdd = role.canAccessAllTools
    ? [...availableKeys].filter(
        (key) => key !== toolKey && !retainedKeys.has(key),
      )
    : isEnabled
      ? [toolKey]
      : [];

  return {
    ...role,
    canAccessAllTools: false,
    permissionFlags: [
      ...retainedFlags,
      ...flagsToAdd.map((flag) => ({
        flag,
        id: createPermissionId(),
        roleId: role.id,
      })),
    ],
  };
};
