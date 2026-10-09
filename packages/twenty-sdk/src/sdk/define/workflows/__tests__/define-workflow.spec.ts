import { type WorkflowManifest } from 'twenty-shared/application';

import { defineWorkflow } from '@/sdk/define/workflows/define-workflow';

const STEP_ID = '44444444-4444-4444-8444-444444444444';

const workflow: WorkflowManifest = {
  universalIdentifier: '11111111-1111-4111-8111-111111111111',
  name: 'Application greeting',
  version: {
    trigger: {
      universalIdentifier: '33333333-3333-4333-8333-333333333333',
      type: 'MANUAL',
      nextStepIds: [STEP_ID],
    },
    steps: [
      {
        universalIdentifier: STEP_ID,
        name: 'Greet',
        type: 'LOGIC_FUNCTION',
        logicFunctionUniversalIdentifier:
          '55555555-5555-4555-8555-555555555555',
        input: { greeting: 'Hello' },
        nextStepIds: [],
      },
    ],
  },
};

const withStep = (step: Record<string, unknown>) => ({
  ...workflow,
  version: {
    ...workflow.version,
    steps: [{ ...workflow.version.steps[0], ...step }],
  },
});

describe('defineWorkflow', () => {
  it('accepts a manual workflow', () => {
    expect(defineWorkflow(workflow)).toEqual({
      success: true,
      config: workflow,
      errors: [],
      warnings: [],
    });
  });

  it.each([
    {
      problem: 'a step type applications cannot use',
      definition: withStep({ type: 'CODE' }),
      error:
        'version.steps.0.type: Unsupported step type. Application workflows support: LOGIC_FUNCTION, HTTP_REQUEST, CLASSIFY, ITERATOR, DELAY, WAIT_FOR_EVENT, EMPTY, CREATE_RECORD, UPDATE_RECORD, UPSERT_RECORD, DELETE_RECORD, FIND_RECORDS, PICK_RECORD, FILTER, IF_ELSE, FORM, AI_AGENT',
    },
    {
      problem: 'a trigger type applications cannot use',
      definition: {
        ...workflow,
        version: {
          ...workflow.version,
          trigger: { ...workflow.version.trigger, type: 'WEBHOOK' },
        },
      },
      error: expect.stringMatching(/^version\.trigger\.type: .*MANUAL/),
    },
    {
      problem: 'a cycle',
      definition: withStep({ nextStepIds: [STEP_ID] }),
      error: `Workflow contains a cycle at step ${STEP_ID}`,
    },
  ])('rejects $problem', ({ definition, error }) => {
    const result = defineWorkflow(definition as WorkflowManifest);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([error]);
  });
});
