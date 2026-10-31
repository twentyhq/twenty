import { isDefined } from 'twenty-shared/utils';

import { resolveInlinedResponseFormat } from 'src/database/commands/upgrade-version-command/2-55/utils/resolve-inlined-response-format.util';
import { type StepAgentInlineConfig } from 'src/database/commands/upgrade-version-command/2-55/utils/step-agent-inline-config.type';

export type StoredRunSpec = {
  agentId?: unknown;
  responseFormat?: unknown;
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
}): { runSpec: StoredRunSpec; hasChanged: boolean } => {
  // only a step with human input can ask humans, so the spec alone marks it conversational
  if (isOnConversationalStep || runSpec.capabilities?.canAskHumans === true) {
    return { runSpec, hasChanged: false };
  }

  const { agentId: _agentId, responseFormat, ...rest } = runSpec;
  const inlinedResponseFormat = resolveInlinedResponseFormat({
    stepResponseFormat: responseFormat,
    agentResponseFormat: inlineConfig.responseFormat,
  });

  return {
    runSpec: {
      ...rest,
      agentId: null,
      inlineConfig: {
        instructions: inlineConfig.instructions,
        modelId: inlineConfig.modelId,
        modelConfiguration: inlineConfig.modelConfiguration,
        scope: inlineConfig.scope,
        applicationId,
        promptCacheKey: `workflow-step:${stepId}`,
      },
      ...(isDefined(inlinedResponseFormat)
        ? { responseFormat: inlinedResponseFormat }
        : {}),
    },
    hasChanged: true,
  };
};
