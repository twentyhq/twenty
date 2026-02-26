import { defineLogicFunction } from 'twenty-sdk';

import { syncCloudUserWorkspaces } from 'src/logic-functions/sync-product-data/sync-cloud-user-workspaces';
import { syncCloudUsers } from 'src/logic-functions/sync-product-data/sync-cloud-users';
import { syncCloudWorkspaces } from 'src/logic-functions/sync-product-data/sync-cloud-workspaces';

const handler = async (): Promise<{ message: string }> => {
  try {
    console.log('Starting product data sync');

    const cloudUsersResult = await syncCloudUsers();

    console.log(
      `Cloud users sync complete: ${cloudUsersResult.syncedCount} users`,
    );

    const cloudWorkspacesResult = await syncCloudWorkspaces();

    console.log(
      `Cloud workspaces sync complete: ${cloudWorkspacesResult.syncedCount} workspaces`,
    );

    const cloudUserWorkspacesResult = await syncCloudUserWorkspaces();

    console.log(
      `Cloud user workspaces sync complete: ${cloudUserWorkspacesResult.syncedCount} user workspaces`,
    );

    return {
      message: `Product data sync complete — ${cloudUsersResult.syncedCount} users, ${cloudWorkspacesResult.syncedCount} workspaces, ${cloudUserWorkspacesResult.syncedCount} user workspaces`,
    };
  } catch (err) {
    console.log(err);

    throw err;
  }
};

export default defineLogicFunction({
  universalIdentifier: '3897e059-715e-4a4b-b165-c44f17d2e30a',
  name: 'sync-product-data',
  description:
    'Syncs cloud users, cloud workspaces, and cloud user workspaces from ClickHouse',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: {
    pattern: '*/10 * * * *',
  },
});
