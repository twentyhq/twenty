import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type CallWebhookJobData } from 'src/engine/core-modules/webhook/jobs/call-webhook.job';
import { type Webhook } from 'src/engine/core-modules/webhook/webhook.entity';
import { removeSecretFromWebhookRecord } from 'src/utils/remove-secret-from-webhook-record';
import type { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';

export const transformEventBatchToWebhookEvents = ({
  workspaceEventBatch,
  webhooks,
}: {
  workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
  webhooks: Webhook[];
}): CallWebhookJobData[] => {
  const result: CallWebhookJobData[] = [];

  for (const webhook of webhooks) {
    const targetUrl = webhook.targetUrl;
    const eventName = workspaceEventBatch.name;
    const objectMetadataForWebhook = {
      id: workspaceEventBatch.objectMetadata.id,
      nameSingular: workspaceEventBatch.objectMetadata.nameSingular,
    };
    const workspaceId = workspaceEventBatch.workspaceId;
    const webhookId = webhook.id;
    const eventDate = new Date();
    const secret = webhook.secret;

    const [nameSingular, _] = workspaceEventBatch.name.split('.');

    for (const eventData of workspaceEventBatch.events) {
      const record =
        'after' in eventData.properties && isDefined(eventData.properties.after)
          ? eventData.properties.after
          : 'before' in eventData.properties &&
              isDefined(eventData.properties.before)
            ? eventData.properties.before
            : {};
      const updatedFields =
        'updatedFields' in eventData.properties
          ? eventData.properties.updatedFields
          : undefined;

      const isWebhookEvent = nameSingular === 'webhook';

      const sanitizedRecord = removeSecretFromWebhookRecord(
        record,
        isWebhookEvent,
      );

      result.push({
        targetUrl,
        eventName,
        objectMetadata: objectMetadataForWebhook,
        workspaceId,
        webhookId,
        eventDate,
        record: sanitizedRecord,
        ...(updatedFields && { updatedFields }),
        secret,
      });
    }
  }

  return result;
};
