import { ToolCategory } from 'twenty-shared/ai';

// Their tool names differ per workspace, which clients that snapshot tools/list cannot follow; record tools cover DATABASE_CRUD
const WORKSPACE_SPECIFIC_TOOL_CATEGORIES: ToolCategory[] = [
  ToolCategory.DATABASE_CRUD,
  ToolCategory.LOGIC_FUNCTION,
  ToolCategory.MCP,
];

export const MCP_GENERIC_MODE_LISTED_TOOL_CATEGORIES: ToolCategory[] =
  Object.values(ToolCategory).filter(
    (category) => !WORKSPACE_SPECIFIC_TOOL_CATEGORIES.includes(category),
  );
