export const hasUserApprovedRoleGrantsForVersion = ({
  hasUserApprovedRoleGrants,
  approvedVersion,
  resolvedVersion,
}: {
  hasUserApprovedRoleGrants?: boolean;
  approvedVersion?: string;
  resolvedVersion: string;
}): boolean =>
  (hasUserApprovedRoleGrants ?? false) && approvedVersion === resolvedVersion;
