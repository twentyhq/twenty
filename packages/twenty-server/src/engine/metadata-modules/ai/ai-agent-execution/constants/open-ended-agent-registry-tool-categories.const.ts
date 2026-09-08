import { ToolCategory } from 'twenty-shared/ai';

// Open-ended agents (runAgent / Slack) act for a resolved workspace member, so
// their reach is bounded by that member's role, not by this list. DASHBOARD and
// WORKFLOW are safe to expose because their providers gate on the LAYOUTS and
// WORKFLOWS permission flags. The categories left out (METADATA, VIEW, ROLE,
// WEBHOOK, NAVIGATION_MENU_ITEM, LOGIC_FUNCTION) have no such gate today, and
// let a caller reshape the workspace rather than act on its records.
export const OPEN_ENDED_AGENT_REGISTRY_TOOL_CATEGORIES: ToolCategory[] = [
  ToolCategory.DATABASE_CRUD,
  ToolCategory.ACTION,
  ToolCategory.DASHBOARD,
  ToolCategory.WORKFLOW,
];
