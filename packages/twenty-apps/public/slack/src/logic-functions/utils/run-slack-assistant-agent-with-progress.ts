import {
  runAgent,
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-sdk/logic-function';

export const runSlackAssistantAgentWithProgress = async ({
  agentUniversalIdentifier,
  prompt,
  startProgressUpdates,
}: RunAgentInput & {
  startProgressUpdates: () => () => Promise<void>;
}): Promise<RunAgentResult> => {
  const stopProgressUpdates = startProgressUpdates();

  try {
    return await runAgent({ agentUniversalIdentifier, prompt });
  } finally {
    await stopProgressUpdates();
  }
};
