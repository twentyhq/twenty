import { isDefined } from 'twenty-shared/utils';

import {
  resolveInlinedResponseFormat,
  type StepAgentInlineConfig,
} from 'src/database/commands/upgrade-version-command/2-55/utils/inline-workflow-step-agents.util';

type StoredRunSpec = { agentId?: unknown; responseFormat?: unknown } & Record<
  string,
  unknown
>;

// A paused step continues from its wake-up's run spec, which now carries the config its agent held
export const inlinePausedAgentRunSpec = ({
  runSpec,
  inlineConfig,
  applicationId,
  stepId,
}: {
  runSpec: StoredRunSpec;
  inlineConfig: StepAgentInlineConfig;
  applicationId: string | null;
  stepId: string;
}): Record<string, unknown> => {
  const { agentId: _agentId, responseFormat, ...rest } = runSpec;
  const inlinedResponseFormat = resolveInlinedResponseFormat({
    stepResponseFormat: responseFormat,
    agentResponseFormat: inlineConfig.responseFormat,
  });

  return {
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
  };
};
