import { type McpInitializeResult } from 'src/engine/api/mcp/types/mcp-initialize-result.type';
import { type McpToolCallResult } from 'src/engine/api/mcp/types/mcp-tool-call-result.type';
import { type McpToolsListResult } from 'src/engine/api/mcp/types/mcp-tools-list-result.type';

export type McpResult =
  | McpInitializeResult
  | McpToolCallResult
  | McpToolsListResult
  | { prompts: [] }
  | { resources: [] }
  | Record<string, never>;
