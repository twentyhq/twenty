// Interactive tools that only make sense in a chat session with a user
// present, not in a headless workflow run.
export const WORKFLOW_AGENT_EXCLUDED_TOOL_NAMES = [
  'search_help_center',
  'navigate_app',
] as const;
