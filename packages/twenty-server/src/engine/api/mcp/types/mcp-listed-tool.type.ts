import { type JSONSchema7 } from 'json-schema';

import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';

export type McpListedTool = {
  name: string;
  description: string | undefined;
  inputSchema: JSONSchema7;
  annotations: McpToolAnnotations;
};
