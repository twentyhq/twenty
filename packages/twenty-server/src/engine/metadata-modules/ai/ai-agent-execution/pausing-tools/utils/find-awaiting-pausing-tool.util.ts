import { isDefined } from 'twenty-shared/utils';

import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { type PausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool.type';
import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/is-awaiting-pausing-tool-output.util';

export const findAwaitingPausingTool = ({
  toolName,
  toolOutput,
}: {
  toolName: string | null;
  toolOutput: unknown;
}): PausingTool | undefined =>
  isDefined(toolName) && isAwaitingPausingToolOutput(toolOutput)
    ? PAUSING_TOOLS.get(toolName)
    : undefined;
