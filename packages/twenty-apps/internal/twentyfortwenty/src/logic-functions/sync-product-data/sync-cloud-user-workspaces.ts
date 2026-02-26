import { z } from 'zod';

import { getApplicationConfig } from 'src/shared/application-config';
import { fetchFromClickHouse } from 'src/shared/clickhouse-client';
import { twentyClient } from 'src/shared/twenty-client';

const clickHouseUserWorkspaceSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string(),
  is_active_membership: z.coerce.boolean(),
});

type ClickHouseUserWorkspace = z.infer<typeof clickHouseUserWorkspaceSchema>;

const fetchUserWorkspacesFromClickHouse = async (): Promise<
  ClickHouseUserWorkspace[]
> => {
  const { clickHouseDatabase } = getApplicationConfig();

  // const nowDate = 'now()'
  const nowDate = "'2026-02-04 14:28:52.000'";

  const query = `
    SELECT
      *
    FROM (
      SELECT
        *,
        row_number() OVER (PARTITION BY id ORDER BY updatedAt DESC) AS rn
      FROM
        ${clickHouseDatabase}.user_workspace
      WHERE
        updatedAt >= ${nowDate} - INTERVAL 500 MINUTE
          AND
        updatedAt <= ${nowDate}
    )
    WHERE
      rn = 1
    FORMAT
      JSONEachRow;
  `;

  return fetchFromClickHouse(query, clickHouseUserWorkspaceSchema);
};

const buildCloudUserWorkspaceInput = (
  userWorkspace: ClickHouseUserWorkspace,
) => ({
  id: userWorkspace.id,
  twentyUserIdentifier: userWorkspace.userId,
  twentyWorkspaceIdentifier: userWorkspace.workspaceId,
  idOfTheUserWorkspace: userWorkspace.id,
  cloudUser2Id: userWorkspace.userId,
  cloudWorkspace2Id: userWorkspace.workspaceId,
});

export const syncCloudUserWorkspaces = async (): Promise<{
  syncedCount: number;
}> => {
  const userWorkspaces = await fetchUserWorkspacesFromClickHouse();

  console.log(
    `Fetched ${userWorkspaces.length} user workspaces from ClickHouse`,
  );

  if (userWorkspaces.length === 0) {
    return { syncedCount: 0 };
  }

  const cloudUserWorkspaceInputs = userWorkspaces.map(
    buildCloudUserWorkspaceInput,
  );

  console.log(
    `Batch-upserting ${cloudUserWorkspaceInputs.length} cloud user workspaces`,
  );

  await twentyClient.mutation({
    createCloudUserWorkspaces2: {
      __args: {
        data: cloudUserWorkspaceInputs,
        upsert: true,
      },
      __scalar: true,
    },
  });

  return { syncedCount: userWorkspaces.length };
};
