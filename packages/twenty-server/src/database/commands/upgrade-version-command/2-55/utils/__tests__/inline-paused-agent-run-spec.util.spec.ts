import { inlinePausedAgentRunSpec } from 'src/database/commands/upgrade-version-command/2-55/utils/inline-paused-agent-run-spec.util';

const RUN_SPEC = {
  agentId: 'agent-id',
  title: 'Qualify',
  baseSystemPrompt: 'You run inside a workflow.',
  instructions: null,
  capabilities: { canAskHumans: true },
};

describe('inlinePausedAgentRunSpec', () => {
  it('replaces the agent with the config it held', () => {
    expect(
      inlinePausedAgentRunSpec({
        runSpec: RUN_SPEC,
        inlineConfig: {
          instructions: 'Qualify the lead.',
          modelId: 'model-id',
          modelConfiguration: null,
          responseFormat: {
            type: 'json',
            schema: { type: 'object', properties: {} },
          },
          scope: null,
        },
        applicationId: 'custom-application-id',
        stepId: 'step-id',
      }),
    ).toEqual({
      title: 'Qualify',
      baseSystemPrompt: 'You run inside a workflow.',
      instructions: null,
      capabilities: { canAskHumans: true },
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
});
