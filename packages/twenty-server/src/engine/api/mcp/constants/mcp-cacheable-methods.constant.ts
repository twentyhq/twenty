import { type McpMethod } from 'src/engine/api/mcp/types/mcp-method.type';

export const MCP_CACHEABLE_METHODS: McpMethod[] = [
  'server/discover',
  'tools/list',
  'resources/list',
  'prompts/list',
];
