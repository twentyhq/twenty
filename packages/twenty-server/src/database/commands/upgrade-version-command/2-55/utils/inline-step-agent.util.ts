import { type AgentResponseFormat } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

// A step without a format already gets text, so only the agent's json format is worth carrying
export const inlineStepAgent = ({
  agentReference,
  agentResponseFormat,
  inlinedFields,
}: {
  agentReference: Record<string, unknown>;
  agentResponseFormat: AgentResponseFormat | null;
  inlinedFields: Record<string, unknown>;
}): Record<string, unknown> => {
  const { agentId: _agentId, responseFormat, ...rest } = agentReference;
  const inlinedResponseFormat = isDefined(responseFormat)
    ? responseFormat
    : agentResponseFormat?.type === 'json'
      ? agentResponseFormat
      : undefined;

  return {
    ...rest,
    ...inlinedFields,
    ...(isDefined(inlinedResponseFormat)
      ? { responseFormat: inlinedResponseFormat }
      : {}),
  };
};
