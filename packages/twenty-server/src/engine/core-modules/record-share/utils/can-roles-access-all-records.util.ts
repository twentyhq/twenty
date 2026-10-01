/* @license Enterprise */

// Several roles combine as an intersection, so every one of them needs the
// permission for the restrictions to be lifted
export const canRolesAccessAllRecords = ({
  roleIds,
  roleIdsWithAllRecordsAccess,
}: {
  roleIds: string[];
  roleIdsWithAllRecordsAccess: string[];
}): boolean =>
  roleIds.length > 0 &&
  roleIds.every((roleId) => roleIdsWithAllRecordsAccess.includes(roleId));
