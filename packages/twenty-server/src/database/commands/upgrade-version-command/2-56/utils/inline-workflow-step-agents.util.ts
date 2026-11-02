import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { hasWorkflowAiAgentConversationConfig } from 'twenty-shared/workflow';

import { inlineStepAgent } from 'src/database/commands/upgrade-version-command/2-56/utils/inline-step-agent.util';
import {
  type StepAgentInlineConfig,
  type StoredWorkflowStep,
} from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';

export type KeptWorkflowStep = {
  stepId: string;
  stepName: string | null;
  agentId: string;
};

export const inlineWorkflowStepAgents = ({
  steps,
  inlineConfigByAgentId,
  keptAgentIds,
}: {
  steps: StoredWorkflowStep[];
  inlineConfigByAgentId: ReadonlyMap<string, StepAgentInlineConfig>;
  keptAgentIds: ReadonlySet<string>;
}): {
  steps: StoredWorkflowStep[];
  hasChanged: boolean;
  inlinedAgentIds: string[];
  keptSteps: KeptWorkflowStep[];
  conversationalSteps: KeptWorkflowStep[];
} => {
  let hasChanged = false;
  const inlinedAgentIds = new Set<string>();
  const keptSteps: KeptWorkflowStep[] = [];
  const conversationalSteps: KeptWorkflowStep[] = [];

  const rewrittenSteps = steps.map((step) => {
    const input = step.settings?.input;
    const agentId = input?.agentId;

    if (step.type !== 'AI_AGENT' || !isDefined(input) || !isString(agentId)) {
      return step;
    }

    const isStepAgent =
      inlineConfigByAgentId.has(agentId) || keptAgentIds.has(agentId);

    const keptStep = {
      stepId: String(step.id),
      stepName: isString(step.name) ? step.name : null,
      agentId,
    };

    // human input or a conversation needs an agent, so the step keeps it
    if (
      isStepAgent &&
      hasWorkflowAiAgentConversationConfig({
        ...input,
        humanInputInstructions: isString(input.humanInputInstructions)
          ? input.humanInputInstructions
          : undefined,
      })
    ) {
      conversationalSteps.push(keptStep);

      return step;
    }

    if (keptAgentIds.has(agentId)) {
      keptSteps.push(keptStep);

      return step;
    }

    const inlineConfig = inlineConfigByAgentId.get(agentId);

    if (!isDefined(inlineConfig)) {
      return step;
    }

    hasChanged = true;
    inlinedAgentIds.add(agentId);

    return {
      ...step,
      settings: {
        ...step.settings,
        input: inlineStepAgent({
          agentReference: input,
          agentResponseFormat: inlineConfig.responseFormat,
          inlinedFields: {
            instructions: inlineConfig.instructions,
            modelId: inlineConfig.modelId,
            ...(isDefined(inlineConfig.modelConfiguration)
              ? { modelConfiguration: inlineConfig.modelConfiguration }
              : {}),
            ...(isDefined(inlineConfig.scope)
              ? { scope: inlineConfig.scope }
              : {}),
          },
        }),
      },
    };
  });

  return {
    steps: rewrittenSteps,
    hasChanged,
    inlinedAgentIds: [...inlinedAgentIds],
    keptSteps,
    conversationalSteps,
  };
};
