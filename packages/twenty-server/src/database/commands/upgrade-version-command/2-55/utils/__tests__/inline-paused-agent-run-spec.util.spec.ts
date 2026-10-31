import { inlinePausedAgentRunSpec } from 'src/database/commands/upgrade-version-command/2-55/utils/inline-paused-agent-run-spec.util';
import { type StepAgentInlineConfig } from 'src/database/commands/upgrade-version-command/2-55/utils/step-agent-inline-config.type';

const RUN_SPEC = {
  agentId: 'agent-id',
  title: 'Qualify',
  baseSystemPrompt: 'You run inside a workflow.',
  instructions: null,
  capabilities: { canAskHumans: false },
};

const INLINE_CONFIG: StepAgentInlineConfig = {
  instructions: 'Qualify the lead.',
  modelId: 'model-id',
  modelConfiguration: null,
  responseFormat: {
    type: 'json',
    schema: { type: 'object', properties: {} },
  },
  scope: null,
};

describe('inlinePausedAgentRunSpec', () => {
  it('replaces the agent with the config it held', () => {
    expect(
      inlinePausedAgentRunSpec({
        runSpec: RUN_SPEC,
        isOnConversationalStep: false,
        inlineConfig: INLINE_CONFIG,
        applicationId: 'custom-application-id',
        stepId: 'step-id',
      }).runSpec,
    ).toEqual({
      title: 'Qualify',
      baseSystemPrompt: 'You run inside a workflow.',
      instructions: null,
      capabilities: { canAskHumans: false },
      agentId: null,
      inlineConfig: {
        instructions: 'Qualify the lead.',
        modelId: 'model-id',
        modelConfiguration: null,
        scope: null,
        applicationId: 'custom-application-id',
        promptCacheKey: 'workflow-step:step-id',
      },
      responseFormat: {
        type: 'json',
        schema: { type: 'object', properties: {} },
      },
    });
  });

  it('leaves a paused run on a conversational step on its agent', () => {
    expect(
      inlinePausedAgentRunSpec({
        runSpec: RUN_SPEC,
        isOnConversationalStep: true,
        inlineConfig: INLINE_CONFIG,
        applicationId: 'custom-application-id',
        stepId: 'step-id',
      }),
    ).toEqual({ runSpec: RUN_SPEC, hasChanged: false });
  });

  it('leaves a paused run that can ask humans on its agent', () => {
    const runSpec = { ...RUN_SPEC, capabilities: { canAskHumans: true } };

    expect(
      inlinePausedAgentRunSpec({
        runSpec,
        isOnConversationalStep: false,
        inlineConfig: INLINE_CONFIG,
        applicationId: 'custom-application-id',
        stepId: 'step-id',
      }),
    ).toEqual({ runSpec, hasChanged: false });
  });
});
