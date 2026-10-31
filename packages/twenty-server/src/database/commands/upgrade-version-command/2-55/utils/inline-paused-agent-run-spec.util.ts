import { isDefined } from 'twenty-shared/utils';

import { resolveInlinedResponseFormat } from 'src/database/commands/upgrade-version-command/2-55/utils/resolve-inlined-response-format.util';
import { type StepAgentInlineConfig } from 'src/database/commands/upgrade-version-command/2-55/utils/step-agent-inline-config.type';

type StoredRunSpec = { agentId?: unknown; responseFormat?: unknown } & Record<
  string,
  unknown
>;

// a paused step continues from its wake-up's run spec, not from its rewritten settings
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
}): { agentId: null } & Record<string, unknown> => {
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
