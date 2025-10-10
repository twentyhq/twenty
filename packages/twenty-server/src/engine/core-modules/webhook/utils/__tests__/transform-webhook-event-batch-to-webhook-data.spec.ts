import { transformEventBatchToWebhookBatch } from 'src/engine/core-modules/webhook/utils/transform-webhook-event-batch-to-webhook-data';
import type { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import type { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import type { Webhook } from 'src/engine/core-modules/webhook/webhook.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

describe('transformWebhookEventBatchToWebhookData', () => {
  it('should transform properly', () => {
    const workspaceEventBatch = {
      workspaceId: 'workspaceId',
      objectMetadata: {
        id: 'id',
        nameSingular: 'nameSingular',
      } as ObjectMetadataEntity,
      name: 'objectNameSingular.created',
      events: [
        {
          recordId: 'recordId-1',
          properties: {
            after: {
              id: 'id-1',
              nameSingular: 'nameSingular-1',
            },
          },
        },
        {
          recordId: 'recordId-2',
          properties: {
            before: {
              id: 'id-2',
              nameSingular: 'nameSingular-2',
            },
          },
        },
        {
          recordId: 'recordId-3',
          properties: {
            after: {
              id: 'id-3',
              nameSingular: 'nameSingular-3',
              secret: 'secret-3',
            },
            updatedFields: ['nameSingular'],
          },
        },
      ],
    } as WorkspaceEventBatch<ObjectRecordEvent>;

    const webhook = {
      id: 'webhook-id',
      targetUrl: 'targetUrl',
      secret: 'secret',
    } as Webhook;

    const result = transformEventBatchToWebhookBatch({
      workspaceEventBatch,
      webhook,
    });
    const expectedResultWithoutEventDate = {
      targetUrl: 'targetUrl',
      eventName: 'objectNameSingular.created',
      objectMetadata: {
        id: 'id',
        nameSingular: 'nameSingular',
      },
      workspaceId: 'workspaceId',
      webhookId: 'webhook-id',
      items: [
        {
          record: {
            id: 'id-1',
            nameSingular: 'nameSingular-1',
          },
        },
        {
          record: {
            id: 'id-2',
            nameSingular: 'nameSingular-2',
          },
        },
        {
          record: {
            id: 'id-3',
            nameSingular: 'nameSingular-3',
            secret: 'secret-3',
          },
          updatedFields: ['nameSingular'],
        },
      ],
      batchSize: 3,
      secret: 'secret',
    };

    const { eventDate, ...resultWithoutEventDate } = result;

    expect(eventDate).toBeDefined();

    expect(resultWithoutEventDate).toEqual(expectedResultWithoutEventDate);
  });

  it('should sanitize records properly', () => {
    const workspaceEventBatch = {
      workspaceId: 'workspaceId',
      objectMetadata: {
        id: 'id',
        nameSingular: 'webhook',
      } as ObjectMetadataEntity,
      name: 'webhook.created',
      events: [
        {
          recordId: 'recordId-1',
          properties: {
            after: {
              id: 'id-1',
              targetUrl: 'targetUrl-1',
              secret: 'secret-1',
            },
          },
        },
      ],
    } as WorkspaceEventBatch<ObjectRecordEvent>;

    const webhook = {
      id: 'webhook-id',
      targetUrl: 'targetUrl',
      secret: 'secret',
    } as Webhook;

    const result = transformEventBatchToWebhookBatch({
      workspaceEventBatch,
      webhook,
    });
    const expectedResultWithoutEventDate = {
      targetUrl: 'targetUrl',
      eventName: 'webhook.created',
      objectMetadata: {
        id: 'id',
        nameSingular: 'webhook',
      },
      workspaceId: 'workspaceId',
      webhookId: 'webhook-id',
      items: [
        {
          record: {
            id: 'id-1',
            targetUrl: 'targetUrl-1',
            // No secret
          },
        },
      ],
      batchSize: 1,
      secret: 'secret',
    };

    const { eventDate, ...resultWithoutEventDate } = result;

    expect(eventDate).toBeDefined();

    expect(resultWithoutEventDate).toEqual(expectedResultWithoutEventDate);
  });
});
