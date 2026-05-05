import { COMMON_PRELOAD_TOOLS } from 'src/engine/core-modules/tool-provider/constants/common-preload-tools.const';
import { EXA_WEB_SEARCH_TOOL_NAME } from 'src/engine/core-modules/tool-provider/constants/exa-web-search-tool-name.const';

export const AI_CHAT_TOOL_NAMES_TO_PRELOAD: string[] = [
  ...COMMON_PRELOAD_TOOLS,
  EXA_WEB_SEARCH_TOOL_NAME,
];
