import { isDefined } from 'twenty-shared/utils';

import { inlineWorkflowStepAgentInput } from 'src/database/commands/upgrade-version-command/2-55/utils/inline-workflow-step-agent-input.util';
import { isConversationalWorkflowStepInput } from 'src/database/commands/upgrade-version-command/2-55/utils/is-conversational-workflow-step-input.util';
import {
  type StepAgentInlineConfig,
  type StoredWorkflowStep,
} from 'src/database/commands/upgrade-version-command/2-55/utils/step-agent-inline-config.type';

export type ConversationalWorkflowStep = {
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
  keptStepIds: string[];
  conversationalSteps: ConversationalWorkflowStep[];
} => {
  let hasChanged = false;
  const keptStepIds: string[] = [];
  const conversationalSteps: ConversationalWorkflowStep[] = [];

  const rewrittenSteps = steps.map((step) => {
    const input = step.settings?.input;
    const agentId = input?.agentId;

    if (
      step.type !== 'AI_AGENT' ||
      !isDefined(input) ||
      typeof agentId !== 'string'
    ) {
      return step;
    }

    const isStepAgent =
      inlineConfigByAgentId.has(agentId) || keptAgentIds.has(agentId);

    if (isStepAgent && isConversationalWorkflowStepInput(input)) {
      conversationalSteps.push({
        stepId: String(step.id),
        stepName: typeof step.name === 'string' ? step.name : null,
        agentId,
      });

      return step;
    }

    if (keptAgentIds.has(agentId)) {
      keptStepIds.push(String(step.id));

      return step;
    }

    const inlineConfig = inlineConfigByAgentId.get(agentId);

    if (!isDefined(inlineConfig)) {
      return step;
    }

    hasChanged = true;

    return {
      ...step,
      settings: {
        ...step.settings,
        input: inlineWorkflowStepAgentInput({ input, inlineConfig }),
      },
    };
  });

  return {
    steps: rewrittenSteps,
    hasChanged,
    keptStepIds,
    conversationalSteps,
  };
};
