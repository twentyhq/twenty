import { OUTPUT_NAVIGATION_TOOL_NAMES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/output-navigation-tool-names.constant';

export const WORKFLOW_AGENT_EXCLUDED_TOOL_NAMES = [
  ...OUTPUT_NAVIGATION_TOOL_NAMES,
  'navigate_app',
  'search_help_center',
] as const;
