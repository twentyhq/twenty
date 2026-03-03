import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type DataSource } from 'typeorm';

// Finds the oldest active workspace that has at least one admin user
// (canAccessFullAdminPanel or canImpersonate). Used to assign marketplace
// catalog ApplicationRegistrations to a real workspace.
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
