import { z } from 'zod';

import { buildToolInputJsonSchemaOrThrow } from 'src/engine/core-modules/tool-provider/utils/build-tool-input-json-schema-or-throw.util';

describe('buildToolInputJsonSchemaOrThrow', () => {
  it('should convert the input schema to JSON schema', () => {
    expect(
      buildToolInputJsonSchemaOrThrow({
        toolName: 'delete_webhook',
        inputSchema: z.object({
          id: z.uuid().describe('The id of the webhook to delete'),
        }),
      }),
    ).toEqual({
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'The id of the webhook to delete',
        },
      },
      required: ['id'],
    });
  });

  it('should name the tool when the schema cannot be converted', () => {
    expect(() =>
      buildToolInputJsonSchemaOrThrow({
        toolName: 'schedule_webhook',
        inputSchema: z.object({ runAt: z.date() }),
      }),
    ).toThrow(
      '@DefineTool "schedule_webhook" has an inputSchema that cannot be converted to JSON schema',
    );
  });
});
