import { type ActionToolId } from 'src/engine/core-modules/tool-provider/constants/action-tool-label.constant';

export const AGENT_RUN_EXCLUDED_TOOL_NAMES = [
  'search_help_center',
  'create_file_upload',
  'complete_file_upload',
  // Sharing checks the triggering user's permissions, not the narrower agent role
  'share_record',
] as const satisfies readonly ActionToolId[];
