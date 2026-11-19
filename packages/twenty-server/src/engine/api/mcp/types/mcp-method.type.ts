import { type MCP_METHODS } from 'src/engine/api/mcp/constants/mcp-methods.constant';

export type McpMethod = (typeof MCP_METHODS)[number];
