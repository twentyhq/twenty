import { type AgentResponseFormat } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

// a step without a format already gets text, so only the agent's json format is worth carrying
export const resolveInlinedResponseFormat = ({
  stepResponseFormat,
  agentResponseFormat,
}: {
  stepResponseFormat: unknown;
  agentResponseFormat: AgentResponseFormat | null;
}): unknown => {
  if (isDefined(stepResponseFormat)) {
    return stepResponseFormat;
  }

  if (agentResponseFormat?.type === 'json') {
    return agentResponseFormat;
  }

  return undefined;
};
