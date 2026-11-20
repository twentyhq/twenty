import { toMcpStatelessResult } from 'src/engine/api/mcp/utils/to-mcp-stateless-result.util';

describe('toMcpStatelessResult', () => {
  it('marks cacheable results as private with a TTL', () => {
    expect(toMcpStatelessResult('tools/list', { tools: [] })).toEqual({
      tools: [],
      resultType: 'complete',
      ttlMs: 60_000,
      cacheScope: 'private',
    });
  });

  it('only marks other results as complete', () => {
    expect(
      toMcpStatelessResult('tools/call', {
        content: [{ type: 'text', text: 'done' }],
        isError: false,
      }),
    ).toEqual({
      content: [{ type: 'text', text: 'done' }],
      isError: false,
      resultType: 'complete',
    });
  });
});
