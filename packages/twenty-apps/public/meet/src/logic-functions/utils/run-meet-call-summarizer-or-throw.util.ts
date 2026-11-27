import {
  RetryableLogicFunctionError,
  runAgent,
} from 'twenty-sdk/logic-function';

import { MEET_CALL_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const runMeetCallSummarizerOrThrow = async (
  prompt: string,
): Promise<{ success: boolean; result: object | null }> => {
  const agentResult = await runAgent({
    agentUniversalIdentifier:
      MEET_CALL_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
    input: prompt,
  }).catch((error: unknown) => {
    throw new RetryableLogicFunctionError(
      `The Google Meet summarizer agent could not run: ${error instanceof Error ? error.message : String(error)}`,
    );
  });

  if (!agentResult.success) {
    throw new RetryableLogicFunctionError(
      `The Google Meet summarizer agent failed: ${agentResult.error ?? agentResult.status}`,
    );
  }

  return agentResult;
};
