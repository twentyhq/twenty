import { type MCP_METHODS } from 'src/engine/api/mcp/constants/mcp-methods.const';

export type McpMethod = (typeof MCP_METHODS)[number];
