import { OpenAPIV3_1 } from 'openapi-types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

export const computeWebhooks = (
  type: 'create' | 'update' | 'delete',
  item: ObjectMetadataEntity,
): OpenAPIV3_1.PathItemObject => {
  return {
    post: {
      tags: [item.nameSingular],
      security: [],
      requestBody: {
        description: `*${type}*.**${item.nameSingular}**, *&#42;*.**${item.nameSingular}**, *&#42;*.**&#42;**`,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                targetUrl: {
                  type: 'string',
                  example: 'https://example.com/incomingWebhook',
                },
                description: {
                  type: 'string',
                  example: 'A sample description',
                },
                eventType: {
                  type: 'string',
                  enum: [
                    '*.*',
                    '*.' + item.nameSingular,
                    type + '.' + item.nameSingular,
                  ],
                },
                objectMetadata: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: '370985db-22d8-4463-8e5f-2271d30913bd',
                    },
                    nameSingular: {
                      type: 'string',
                      enum: [item.nameSingular],
                    },
                  },
                },
                workspaceId: {
                  type: 'string',
                  example: '872cfcf1-c79f-42bc-877d-5829f06eb3f9',
                },
                webhookId: {
                  type: 'string',
                  example: '90056586-1228-4e03-a507-70140aa85c05',
                },
                eventDate: {
                  type: 'string',
                  example: '2024-02-14T11:27:01.779Z',
                },
                record: {
                  $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description:
            'Return a 200 status to indicate that the data was received successfully',
        },
      },
    },
  } as OpenAPIV3_1.PathItemObject;
};
