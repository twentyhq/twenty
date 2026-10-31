import { inlineWorkflowStepAgents } from 'src/database/commands/upgrade-version-command/2-55/utils/inline-workflow-step-agents.util';
import {
  type StepAgentInlineConfig,
  type StoredWorkflowStep,
} from 'src/database/commands/upgrade-version-command/2-55/utils/step-agent-inline-config.type';

const INLINE_CONFIG: StepAgentInlineConfig = {
  instructions: 'Qualify the lead.',
  modelId: 'auto-select',
  modelConfiguration: { webSearch: { enabled: true } },
  responseFormat: { type: 'text' },
  scope: {
    objectPermissions: [
      { objectUniversalIdentifier: 'person', canReadObjectRecords: true },
    ],
  },
};

const buildAgentStep = (
  input: Record<string, unknown>,
): StoredWorkflowStep => ({
  id: 'step-id',
  type: 'AI_AGENT',
  name: 'Qualify',
  settings: { input, outputSchema: {} },
});

const inline = ({
  steps,
  inlineConfig = INLINE_CONFIG,
  keptAgentIds = [],
}: {
  steps: StoredWorkflowStep[];
  inlineConfig?: StepAgentInlineConfig;
  keptAgentIds?: string[];
}) =>
  inlineWorkflowStepAgents({
    steps,
    inlineConfigByAgentId: new Map([['agent-id', inlineConfig]]),
    keptAgentIds: new Set(keptAgentIds),
  });

describe('inlineWorkflowStepAgents', () => {
  it('moves the agent config into the step and drops the agent', () => {
    const { steps, hasChanged } = inline({
      steps: [
        buildAgentStep({ agentId: 'agent-id', prompt: 'Qualify {{trigger}}' }),
      ],
    });

    expect(hasChanged).toBe(true);
    expect(steps).toEqual([
      buildAgentStep({
        prompt: 'Qualify {{trigger}}',
        instructions: 'Qualify the lead.',
        modelId: 'auto-select',
        modelConfiguration: { webSearch: { enabled: true } },
        scope: INLINE_CONFIG.scope,
      }),
    ]);
  });

  it("keeps the step's own response format over the agent's", () => {
    const stepResponseFormat = {
      type: 'json',
      schema: { type: 'object', properties: {} },
    };

    const { steps } = inline({
      steps: [
        buildAgentStep({
          agentId: 'agent-id',
          responseFormat: stepResponseFormat,
        }),
      ],
    });

    expect(steps[0].settings?.input).toMatchObject({
      responseFormat: stepResponseFormat,
    });
  });

  it('gives a step whose agent had no role no scope', () => {
    const { steps } = inline({
      steps: [buildAgentStep({ agentId: 'agent-id' })],
      inlineConfig: { ...INLINE_CONFIG, scope: null },
    });

    expect(steps[0].settings?.input).not.toHaveProperty('scope');
  });

  it('leaves other steps and agents it does not inline as they are', () => {
    const steps = [
      { id: 'code', type: 'CODE', settings: { input: {} } },
      buildAgentStep({ agentId: 'installed-app-agent-id' }),
    ];

    expect(inline({ steps })).toEqual({
      steps,
      hasChanged: false,
      keptStepIds: [],
    });
  });

  it('reports the steps whose agent is kept', () => {
    const steps = [buildAgentStep({ agentId: 'agent-id' })];

    expect(inline({ steps, keptAgentIds: ['agent-id'] })).toEqual({
      steps,
      hasChanged: false,
      keptStepIds: ['step-id'],
    });
  });

  it('is a no-op on steps already inlined', () => {
    const { steps } = inline({
      steps: [buildAgentStep({ agentId: 'agent-id' })],
    });

    expect(inline({ steps }).hasChanged).toBe(false);
  });
});
