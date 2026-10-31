import { isDefined } from 'twenty-shared/utils';

import { resolveInlinedResponseFormat } from 'src/database/commands/upgrade-version-command/2-55/utils/resolve-inlined-response-format.util';
import { type StepAgentInlineConfig } from 'src/database/commands/upgrade-version-command/2-55/utils/step-agent-inline-config.type';

export const inlineWorkflowStepAgentInput = ({
  input,
  inlineConfig,
}: {
  input: Record<string, unknown>;
  inlineConfig: StepAgentInlineConfig;
}): Record<string, unknown> => {
  const { agentId: _agentId, responseFormat, ...rest } = input;
  const inlinedResponseFormat = resolveInlinedResponseFormat({
    stepResponseFormat: responseFormat,
    agentResponseFormat: inlineConfig.responseFormat,
  });

  return {
    ...rest,
    instructions: inlineConfig.instructions,
    modelId: inlineConfig.modelId,
    ...(isDefined(inlineConfig.modelConfiguration)
      ? { modelConfiguration: inlineConfig.modelConfiguration }
      : {}),
    ...(isDefined(inlineConfig.scope) ? { scope: inlineConfig.scope } : {}),
    ...(isDefined(inlinedResponseFormat)
      ? { responseFormat: inlinedResponseFormat }
      : {}),
  };
};
