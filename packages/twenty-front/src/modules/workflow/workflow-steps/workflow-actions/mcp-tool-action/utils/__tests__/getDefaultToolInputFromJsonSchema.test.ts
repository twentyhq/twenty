import { getDefaultToolInputFromJsonSchema } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/utils/getDefaultToolInputFromJsonSchema';

describe('getDefaultToolInputFromJsonSchema', () => {
  it('seeds optional inputs with null and required ones with their default', () => {
    expect(
      getDefaultToolInputFromJsonSchema({
        type: 'object',
        required: ['query', 'kinds', 'mode'],
        properties: {
          query: { type: 'string' },
          kinds: { type: 'array', items: { type: 'string' } },
          mode: { type: 'string', enum: ['fast', 'slow'] },
          tags: { type: 'array', items: { type: 'string' } },
          sort: { type: 'string', enum: ['asc', 'desc'] },
          limit: { type: 'number' },
        },
      }),
    ).toEqual({
      query: null,
      kinds: [],
      mode: 'fast',
      tags: null,
      sort: null,
      limit: null,
    });
  });

  it('keeps nested objects editable while their optional leaves stay null', () => {
    expect(
      getDefaultToolInputFromJsonSchema({
        type: 'object',
        properties: {
          filter: {
            type: 'object',
            required: ['status'],
            properties: {
              status: { type: 'string', enum: ['open', 'closed'] },
              labels: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      }),
    ).toEqual({ filter: { status: 'open', labels: null } });
  });

  it('returns an empty input for a tool without properties', () => {
    expect(getDefaultToolInputFromJsonSchema({ type: 'object' })).toEqual({});
  });
});
