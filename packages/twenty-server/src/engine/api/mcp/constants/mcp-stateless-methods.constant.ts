import { type McpMethod } from 'src/engine/api/mcp/types/mcp-method.type';

// ping and initialize do not exist in the stateless revision
export const MCP_STATELESS_METHODS: McpMethod[] = [
  'server/discover',
  'tools/list',
  'tools/call',
  'resources/list',
  'prompts/list',
];
