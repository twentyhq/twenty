import { OpenAPIV3_1 } from 'openapi-types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { capitalize } from 'src/utils/capitalize';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

export const computeWebhooks = (
  type: DatabaseEventAction,
  item: ObjectMetadataEntity,
): OpenAPIV3_1.PathItemObject => {
  const updatedFields = {
    type: 'array',
    items: {
      type: 'string',
    },
  };

  return {
    post: {
      tags: [item.nameSingular],
      security: [],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                targetUrl: {
                  type: 'string',
                  example: 'https://example.com/incomingWebhook',
                },
                eventName: {
                  type: 'string',
                  example: `${item.nameSingular}.${type}`,
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
                  $ref: `#/components/schemas/${capitalize(item.nameSingular)} for Response`,
                },
                ...(type === DatabaseEventAction.UPDATED && { updatedFields }),
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
