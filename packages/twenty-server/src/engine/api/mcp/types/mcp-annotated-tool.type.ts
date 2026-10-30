import { type ToolSet } from 'ai';

import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';

export type McpAnnotatedTool = ToolSet[string] & {
  annotations: McpToolAnnotations;
};
