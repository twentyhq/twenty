import { type ActionToolId } from 'src/engine/core-modules/tool-provider/constants/action-tool-label.constant';

export const EXECUTION_ROLE_BYPASSING_TOOL_NAMES = [
  'code_interpreter',
  'save_campaign',
] as const satisfies readonly ActionToolId[];
