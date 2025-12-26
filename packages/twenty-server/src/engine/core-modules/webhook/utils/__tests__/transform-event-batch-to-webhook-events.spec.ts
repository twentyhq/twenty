import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import type { WebhookEntity } from 'src/engine/core-modules/webhook/webhook.entity';
import { transformEventBatchToWebhookEvents } from 'src/engine/core-modules/webhook/utils/transform-event-batch-to-webhook-events';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const mockObjectMetadata: FlatObjectMetadata = {
  id: 'id',
  nameSingular: 'nameSingular',
  namePlural: 'namePlural',
  workspaceId: 'workspaceId',
  labelSingular: 'Label Singular',
  labelPlural: 'Label Plural',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  universalIdentifier: 'id',
  fieldMetadataIds: [],
  indexMetadataIds: [],
  viewIds: [],
  applicationId: null,
} as unknown as FlatObjectMetadata;

describe('transformEventBatchToWebhookEvents', () => {
  it('should transform properly', () => {
    const workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent> = {
      workspaceId: 'workspaceId',
      objectMetadata: mockObjectMetadata,
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
    };

    const webhooks = [
      {
        id: 'webhook-id',
        targetUrl: 'targetUrl',
        secret: 'secret',
      },
      {
        id: 'webhook-id-2',
        targetUrl: 'targetUrl-2',
        secret: 'secret-2',
      },
    ] as WebhookEntity[];

    const result = transformEventBatchToWebhookEvents({
      workspaceEventBatch,
      webhooks,
    });
    const expectedResultWithoutEventDate = [
      {
        targetUrl: 'targetUrl',
        eventName: 'objectNameSingular.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id',
        record: {
          id: 'id-1',
          nameSingular: 'nameSingular-1',
        },
        secret: 'secret',
      },
      {
        targetUrl: 'targetUrl',
        eventName: 'objectNameSingular.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id',
        record: {
          id: 'id-2',
          nameSingular: 'nameSingular-2',
        },
        secret: 'secret',
      },
      {
        targetUrl: 'targetUrl',
        eventName: 'objectNameSingular.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id',
        record: {
          id: 'id-3',
          nameSingular: 'nameSingular-3',
          secret: 'secret-3',
        },
        updatedFields: ['nameSingular'],
        secret: 'secret',
      },
      {
        targetUrl: 'targetUrl-2',
        eventName: 'objectNameSingular.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id-2',
        record: {
          id: 'id-1',
          nameSingular: 'nameSingular-1',
        },
        secret: 'secret-2',
      },
      {
        targetUrl: 'targetUrl-2',
        eventName: 'objectNameSingular.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id-2',
        record: {
          id: 'id-2',
          nameSingular: 'nameSingular-2',
        },
        secret: 'secret-2',
      },
      {
        targetUrl: 'targetUrl-2',
        eventName: 'objectNameSingular.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id-2',
        record: {
          id: 'id-3',
          nameSingular: 'nameSingular-3',
          secret: 'secret-3',
        },
        updatedFields: ['nameSingular'],
        secret: 'secret-2',
      },
    ];

    const resultWithoutEventDate = result.map((event) => {
      const { eventDate: _, ...eventWithoutEventDate } = event;

      return eventWithoutEventDate;
    });

    expect(resultWithoutEventDate).toEqual(expectedResultWithoutEventDate);
  });

  it('should sanitize records properly', () => {
    const workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent> = {
      workspaceId: 'workspaceId',
      objectMetadata: mockObjectMetadata,
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
    };

    const webhooks = [
      {
        id: 'webhook-id',
        targetUrl: 'targetUrl',
        secret: 'secret',
      },
    ] as WebhookEntity[];

    const result = transformEventBatchToWebhookEvents({
      workspaceEventBatch,
      webhooks,
    });

    const expectedResultWithoutEventDate = [
      {
        targetUrl: 'targetUrl',
        eventName: 'webhook.created',
        objectMetadata: {
          id: mockObjectMetadata.id,
          nameSingular: mockObjectMetadata.nameSingular,
        },
        workspaceId: 'workspaceId',
        webhookId: 'webhook-id',
        record: {
          id: 'id-1',
          targetUrl: 'targetUrl-1',
          // No secret
        },
        secret: 'secret',
      },
    ];

    const resultWithoutEventDate = result.map((event) => {
      const { eventDate: _, ...eventWithoutEventDate } = event;

      return eventWithoutEventDate;
    });

    expect(resultWithoutEventDate).toEqual(expectedResultWithoutEventDate);
  });
});
