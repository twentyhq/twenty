import { MCP_CACHEABLE_METHODS } from 'src/engine/api/mcp/constants/mcp-cacheable-methods.constant';
import { MCP_CACHEABLE_RESULT_TTL_MS } from 'src/engine/api/mcp/constants/mcp-cacheable-result-ttl-ms.constant';
import { type McpMethod } from 'src/engine/api/mcp/types/mcp-method.type';
import {
  type McpResult,
  type McpStatelessResult,
} from 'src/engine/api/mcp/types/mcp-result.type';

// Results vary with the caller's role and workspace, so shared caches must not reuse them
export const toMcpStatelessResult = (
  method: McpMethod,
  result: McpResult,
): McpStatelessResult =>
  Object.assign(
    {},
    result,
    { resultType: 'complete' as const },
    MCP_CACHEABLE_METHODS.includes(method)
      ? { ttlMs: MCP_CACHEABLE_RESULT_TTL_MS, cacheScope: 'private' as const }
      : {},
  );
