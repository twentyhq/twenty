import { type ServerOptions } from '@modelcontextprotocol/server';

const PRIVATE_ONE_MINUTE = { ttlMs: 60_000, cacheScope: 'private' } as const;

// Results depend on the caller's role and workspace, so shared caches must not reuse them
export const MCP_RESULT_CACHE_HINTS = {
  'server/discover': PRIVATE_ONE_MINUTE,
  'tools/list': PRIVATE_ONE_MINUTE,
  'resources/list': PRIVATE_ONE_MINUTE,
  'prompts/list': PRIVATE_ONE_MINUTE,
} as const satisfies ServerOptions['cacheHints'];
