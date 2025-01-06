import { OpenAPIV3_1 } from 'openapi-types';
import { capitalize } from 'twenty-shared';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

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
      parameters: [
        {
          in: 'header',
          name: 'X-Twenty-Webhook-Signature',
          schema: {
            type: 'string',
          },
          description:
            'HMAC SHA256 signature of the request payload using the webhook secret. To compute the signature:\n' +
            '1. Concatenate `X-Twenty-Webhook-Timestamp`, a colon (:), and the JSON string of the request payload.\n' +
            '2. Compute the HMAC SHA256 hash using the shared secret as the key.\n' +
            '3. Send the resulting hex digest as this header value.\n' +
            'Example (Node.js):\n```javascript\n' +
            'const crypto = require("crypto");\n' +
            'const timestamp = "1735066639761";\n' +
            'const payload = JSON.stringify({...});\n' +
            'const secret = "your-secret";\n' +
            'const stringToSign = `${timestamp}:${JSON.stringify(payload)}`;\n' +
            'const signature = crypto.createHmac("sha256", secret)\n  .update(stringToSign)\n  .digest("hex");\n```',
          required: false,
        },
        {
          in: 'header',
          name: 'X-Twenty-Webhook-Timestamp',
          schema: {
            type: 'string',
          },
          description:
            'Unix timestamp of when the webhook was sent. This timestamp is included in the HMAC signature generation to prevent replay attacks.',
          required: false,
        },
        {
          in: 'header',
          name: 'X-Twenty-Webhook-Nonce',
          schema: {
            type: 'string',
          },
          description:
            'Unique identifier for this webhook request to prevent replay attacks. Consumers should ensure this nonce is not reused.',
          required: false,
        },
      ],
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
