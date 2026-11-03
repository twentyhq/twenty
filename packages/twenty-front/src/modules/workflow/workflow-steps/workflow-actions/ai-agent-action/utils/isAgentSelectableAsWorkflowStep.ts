import { type FlatAgent } from '@/metadata-store/types/FlatAgent';
import {
  agentResponseFormatSchema,
  isAgentRunnableAsWorkflowStep,
} from 'twenty-shared/workflow';

// picker-only: a step's output must be known when the workflow is built, so only agents with a JSON output are listed
export const isAgentSelectableAsWorkflowStep = (
  agent: Pick<FlatAgent, 'isActive' | 'isSystem' | 'responseFormat'>,
): boolean => {
  const parsedResponseFormat = agentResponseFormatSchema.safeParse(
    agent.responseFormat,
  );

  return (
    isAgentRunnableAsWorkflowStep(agent) &&
    parsedResponseFormat.success &&
    parsedResponseFormat.data.type === 'json' &&
    Object.keys(parsedResponseFormat.data.schema.properties).length > 0
  );
};
