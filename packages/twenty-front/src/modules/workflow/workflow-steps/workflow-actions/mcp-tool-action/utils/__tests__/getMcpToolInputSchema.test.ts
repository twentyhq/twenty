import { getMcpToolInputSchema } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/utils/getMcpToolInputSchema';

describe('getMcpToolInputSchema', () => {
  it('converts a JSON schema object into the form input schema', () => {
    expect(
      getMcpToolInputSchema({
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'integer' },
        },
      }),
    ).toEqual([
      {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'number' },
        },
      },
    ]);
  });

  it('returns undefined for a non-object schema', () => {
    expect(getMcpToolInputSchema(null)).toBeUndefined();
    expect(getMcpToolInputSchema('string')).toBeUndefined();
  });
});
