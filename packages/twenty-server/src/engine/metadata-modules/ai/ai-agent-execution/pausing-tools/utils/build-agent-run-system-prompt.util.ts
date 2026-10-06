import { isNonEmptyString } from '@sniptt/guards';

import { AGENT_WAIT_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/agent-wait-prompt.constant';

// the wait tools are the engine's, so it explains them; the caller's own instructions come last
export const buildAgentRunSystemPrompt = ({
  baseSystemPrompt,
  instructions,
  canWait,
}: {
  baseSystemPrompt: string;
  instructions: string | null;
  canWait: boolean;
}): string =>
  [
    baseSystemPrompt,
    ...(canWait ? [AGENT_WAIT_PROMPT] : []),
    ...(isNonEmptyString(instructions) ? [instructions] : []),
  ].join('\n\n');
