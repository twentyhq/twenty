import type { AxiosInstance } from "axios";
import { findWebhooks } from "src/logic-functions/requests/find-webhooks.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { createMetadataEntity } from "src/logic-functions/requests/create-metadata-entity.util";
import { logger } from "src/logic-functions/utils/logger.util";

// A newly created workspace has no webhooks by default (unlike skills/views, which ship with
// standard entries), so there's nothing to dedupe against on a first migration - this doesn't
// check the target workspace's existing webhooks before creating.
export const migrateWebhooks = async (targetWorkspace: AxiosInstance, sourceWebhooks: Awaited<ReturnType<typeof findWebhooks>>) => {
  let createdCount = 0;
  for (const webhook of sourceWebhooks) {
    // `secret` is deliberately not copied - omitting it makes the server generate a fresh
    // one, so the two workspaces don't end up sharing the same HMAC signing key.
    await executeWithRetryAndCheckpoint(() => createMetadataEntity(targetWorkspace, 'createWebhook', 'input', 'CreateWebhookInput', {
      id: webhook.id,
      targetUrl: webhook.targetUrl,
      operations: webhook.operations,
      description: webhook.description,
    }));
    createdCount += 1;
  }

  logger.log(`Webhooks: created ${createdCount}. Review each targetUrl - the receiving endpoint may not expect events from this new workspace.`);
};
