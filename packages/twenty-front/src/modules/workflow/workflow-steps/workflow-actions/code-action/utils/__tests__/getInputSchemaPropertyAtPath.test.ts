import { type InputSchema } from 'twenty-shared/workflow';

import { getInputSchemaPropertyAtPath } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getInputSchemaPropertyAtPath';

describe('getInputSchemaPropertyAtPath', () => {
  const inputSchema = [
    {
      type: 'object' as const,
      properties: {
        slackChannelId: { type: 'string' as const },
        messageFormat: {
          type: 'string' as const,
          enum: ['plain', 'markdown'],
        },
        count: { type: 'number' as const },
        nested: {
          type: 'object' as const,
          properties: {
            inner: { type: 'string' as const },
          },
        },
      },
    },
  ] as InputSchema;

  it('should return property at top-level path', () => {
    expect(
      getInputSchemaPropertyAtPath(inputSchema, ['messageFormat']),
    ).toEqual({
      type: 'string',
      enum: ['plain', 'markdown'],
    });
  });

  it('should return property at nested path', () => {
    expect(
      getInputSchemaPropertyAtPath(inputSchema, ['nested', 'inner']),
    ).toEqual({
      type: 'string',
    });
  });

  it('should return undefined when path is invalid', () => {
    expect(
      getInputSchemaPropertyAtPath(inputSchema, ['missing']),
    ).toBeUndefined();
    expect(
      getInputSchemaPropertyAtPath(inputSchema, ['slackChannelId', 'tooDeep']),
    ).toBeUndefined();
  });

  it('should return undefined when inputSchema is missing or empty', () => {
    expect(getInputSchemaPropertyAtPath(undefined, ['a'])).toBeUndefined();
    expect(getInputSchemaPropertyAtPath([], ['a'])).toBeUndefined();
  });
});
