import { type FlatAgent } from '@/metadata-store/types/FlatAgent';
import { agentResponseFormatSchema } from 'twenty-shared/workflow';

// a step's output must be known when the workflow is built, so only agents with a JSON output are offered
export const isAgentSelectableAsWorkflowStep = (
  agent: Pick<FlatAgent, 'isActive' | 'isSystem' | 'responseFormat'>,
): boolean => {
  if (!agent.isActive || agent.isSystem) {
    return false;
  }

  const parsedResponseFormat = agentResponseFormatSchema.safeParse(
    agent.responseFormat,
  );

  return (
    parsedResponseFormat.success &&
    parsedResponseFormat.data.type === 'json' &&
    Object.keys(parsedResponseFormat.data.schema.properties).length > 0
  );
};
