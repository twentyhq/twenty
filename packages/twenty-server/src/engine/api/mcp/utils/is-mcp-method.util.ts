import { MCP_METHODS } from 'src/engine/api/mcp/constants/mcp-methods.const';
import { type McpMethod } from 'src/engine/api/mcp/types/mcp-method.type';

export const isMcpMethod = (method: string): method is McpMethod =>
  MCP_METHODS.some((mcpMethod) => mcpMethod === method);
