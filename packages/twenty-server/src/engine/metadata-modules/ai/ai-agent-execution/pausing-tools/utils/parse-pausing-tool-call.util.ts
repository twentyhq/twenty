import { isDefined } from 'twenty-shared/utils';

import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { type PausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-call.type';

export const parsePausingToolCall = (
  toolPart: { toolName: string | null; toolInput: unknown } | null,
): PausingToolCall | null =>
  isDefined(toolPart?.toolName)
    ? (PAUSING_TOOLS.get(toolPart.toolName)?.parseCall(toolPart.toolInput) ??
      null)
    : null;
