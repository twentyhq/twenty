import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  hasWorkflowAiAgentConfig,
  workflowAiAgentConversationConfigSchema,
} from 'twenty-shared/workflow';

import {
  type StepAgentInlineConfig,
  type StoredWorkflowStep,
} from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';

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
  keptStepAgentIds: string[];
} => {
  let hasChanged = false;
  const keptStepAgentIds = new Set<string>();

  const rewrittenSteps = steps.map((step) => {
    const input = step.settings?.input;
    const agentId = input?.agentId;

    if (step.type !== 'AI_AGENT' || !isDefined(input) || !isString(agentId)) {
      return step;
    }

    const isConversational =
      inlineConfigByAgentId.has(agentId) &&
      hasWorkflowAiAgentConfig(workflowAiAgentConversationConfigSchema, input);

    if (isConversational || keptAgentIds.has(agentId)) {
      keptStepAgentIds.add(agentId);

      return step;
    }

    const inlineConfig = inlineConfigByAgentId.get(agentId);

    if (!isDefined(inlineConfig)) {
      return step;
    }

    hasChanged = true;

    const { agentId: _agentId, responseFormat, ...rest } = input;
    // a step without a format already gets text, so only the agent's json format is worth carrying
    const inlinedResponseFormat =
      !isDefined(responseFormat) && inlineConfig.responseFormat?.type === 'json'
        ? inlineConfig.responseFormat
        : responseFormat;

    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...rest,
          instructions: inlineConfig.instructions,
          modelId: inlineConfig.modelId,
          ...(isDefined(inlineConfig.modelConfiguration)
            ? { modelConfiguration: inlineConfig.modelConfiguration }
            : {}),
          ...(isDefined(inlineConfig.scope)
            ? { scope: inlineConfig.scope }
            : {}),
          ...(isDefined(inlinedResponseFormat)
            ? { responseFormat: inlinedResponseFormat }
            : {}),
        },
      },
    };
  });

  return {
    steps: rewrittenSteps,
    hasChanged,
    keptStepAgentIds: [...keptStepAgentIds],
  };
};
