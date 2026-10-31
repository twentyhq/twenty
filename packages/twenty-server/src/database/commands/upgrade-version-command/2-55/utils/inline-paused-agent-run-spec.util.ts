import { inlineStepAgent } from 'src/database/commands/upgrade-version-command/2-55/utils/inline-step-agent.util';
import {
  type PausedRunInlineConfig,
  type StepAgentInlineConfig,
} from 'src/database/commands/upgrade-version-command/2-55/utils/step-agent-inline-config.type';

export type StoredRunSpec = {
  agentId?: unknown;
  title?: unknown;
  capabilities?: { canAskHumans?: unknown };
} & Record<string, unknown>;

// a paused step continues from its wake-up's run spec, not from its rewritten settings
export const inlinePausedAgentRunSpec = ({
  runSpec,
  isOnConversationalStep,
  inlineConfig,
  applicationId,
  stepId,
}: {
  runSpec: StoredRunSpec;
  isOnConversationalStep: boolean;
  inlineConfig: StepAgentInlineConfig;
  applicationId: string | null;
  stepId: string;
}):
  | { isConversational: true }
  | { isConversational: false; runSpec: StoredRunSpec } => {
  // only a step with human input can ask humans, so the spec alone marks it conversational
  if (isOnConversationalStep || runSpec.capabilities?.canAskHumans === true) {
    return { isConversational: true };
  }

  return {
    isConversational: false,
    runSpec: inlineStepAgent({
      agentReference: runSpec,
      agentResponseFormat: inlineConfig.responseFormat,
      inlinedFields: {
        agentId: null,
        inlineConfig: {
          instructions: inlineConfig.instructions,
          modelId: inlineConfig.modelId,
          modelConfiguration: inlineConfig.modelConfiguration,
          scope: inlineConfig.scope,
          applicationId,
          promptCacheKey: `workflow-step:${stepId}`,
        } satisfies PausedRunInlineConfig,
      },
    }),
  };
};
