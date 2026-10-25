import { ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME } from 'twenty-shared/ai';

import { OUTPUT_NAVIGATION_TOOL_NAMES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/output-navigation-tool-names.constant';

export const MCP_EXCLUDED_TOOL_NAMES = new Set([
  'code_interpreter',
  'http_request',
  ...OUTPUT_NAVIGATION_TOOL_NAMES,
  ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME,
]);
