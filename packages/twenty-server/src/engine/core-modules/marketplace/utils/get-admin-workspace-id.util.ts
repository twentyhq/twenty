import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type DataSource } from 'typeorm';

// Every ApplicationRegistration must be owned by a workspace (workspaceId
// represents ownership / write-access, not visibility scoping — marketplace
// registrations are readable by all workspaces). When the catalog sync creates
// registrations for marketplace apps that no developer has explicitly claimed,
// we assign them to the "admin" workspace: the oldest active workspace whose
// owner has admin privileges.
export const getAdminWorkspaceId = async (
  dataSource: DataSource,
): Promise<string | null> => {
  const result = await dataSource.query<Array<{ workspaceId: string }>>(
    `SELECT uw."workspaceId"
     FROM core."userWorkspace" uw
     JOIN core."user" u ON u.id = uw."userId" AND u."deletedAt" IS NULL
     JOIN core."workspace" w ON w.id = uw."workspaceId" AND w."deletedAt" IS NULL
     WHERE (u."canAccessFullAdminPanel" = true OR u."canImpersonate" = true)
       AND w."activationStatus" = $1
       AND uw."deletedAt" IS NULL
     ORDER BY w."createdAt" ASC
     LIMIT 1`,
    [WorkspaceActivationStatus.ACTIVE],
  );

  if (result.length === 0) {
    return null;
  }

  return result[0].workspaceId;
};
