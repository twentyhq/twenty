import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type CallWebhookJobData } from 'src/engine/core-modules/webhook/jobs/call-webhook.job';
import { type Webhook } from 'src/engine/core-modules/webhook/webhook.entity';
import type { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import { transformEventToWebhookEvent } from 'src/engine/core-modules/webhook/utils/transform-event-to-webhook-event';

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

    for (const eventData of workspaceEventBatch.events) {
      const { record, updatedFields } = transformEventToWebhookEvent({
        eventName: workspaceEventBatch.name,
        event: eventData,
      });

      result.push({
        targetUrl,
        eventName,
        objectMetadata: objectMetadataForWebhook,
        workspaceId,
        webhookId,
        eventDate,
        record,
        ...(updatedFields && { updatedFields }),
        secret,
      });
    }
  }

  return result;
};
