import { type ActionToolId } from 'src/engine/core-modules/tool-provider/constants/action-tool-label.constant';

export const EXECUTION_BOUND_AGENT_EXCLUDED_TOOL_NAMES = [
  'code_interpreter',
  'save_campaign',
] as const satisfies readonly ActionToolId[];
