import { ToolCategory } from 'twenty-shared/ai';

// Everything else stays behind execute_tool: workflow and page layout schemas alone weigh ~300 KB, and app tools differ per workspace
export const MCP_GENERIC_MODE_LISTED_TOOL_CATEGORIES: ToolCategory[] = [
  ToolCategory.METADATA,
];
