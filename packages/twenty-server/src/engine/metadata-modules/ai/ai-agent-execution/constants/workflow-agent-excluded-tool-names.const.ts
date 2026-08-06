import { type ActionToolId } from 'src/engine/core-modules/tool-provider/constants/action-tool-label.constant';

export const WORKFLOW_AGENT_EXCLUDED_TOOL_NAMES = [
  'search_help_center',
  'navigate_app',
] as const satisfies readonly ActionToolId[];
