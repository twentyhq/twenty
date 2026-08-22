import type { AxiosInstance } from "axios";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { createMetadataEntity } from "src/logic-functions/requests/create-metadata-entity.util";
import { logger } from "src/logic-functions/utils/logger.util";
import { Webhook } from "src/logic-functions/types/webhook.type";
import { migrationState, setStateRef } from "src/logic-functions/utils/migration-state.util";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";

export const migrateWebhooks = async (targetWorkspace: AxiosInstance, sourceWebhooks: Webhook[], targetWebhooks: Webhook[]) => {
  const targetWebhooksIds = new Set(targetWebhooks.map(webhook => webhook.id));
  const webhooksToMigrate: Webhook[] = targetWebhooksIds.size === 0 ? sourceWebhooks : sourceWebhooks.filter(webhook => targetWebhooksIds.has(webhook.id) === false);
  let recordsMigrated = 2;
  for (const webhook of webhooksToMigrate) {
    // `secret` is deliberately not copied - omitting it makes the server generate a fresh
    // one, so the two workspaces don't end up sharing the same HMAC signing key.
    await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createWebhook', 'input', 'CreateWebhookInput', {
      id: webhook.id,
      targetUrl: webhook.targetUrl,
      operations: webhook.operations,
      description: webhook.description,
    }));
    recordsMigrated++;
    if (recordsMigrated % migrationState.maxRequests === 0) {
      recordsMigrated = 0;
      if (await stopIfTimeBudgetExceeded()) {
        return false;
      }
    }
  }

  setStateRef('migratedWebhooks', true);
  logger.log(`Webhooks migrated`);
  return true;
};
