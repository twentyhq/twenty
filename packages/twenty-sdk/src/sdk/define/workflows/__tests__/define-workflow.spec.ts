import { type WorkflowManifest } from 'twenty-shared/application';

import { defineWorkflow } from '@/sdk/define/workflows/define-workflow';
import {
  extractDefineEntity,
  TargetFunction,
} from '@/cli/utilities/build/manifest/manifest-extract-config';

const workflow: WorkflowManifest = {
  universalIdentifier: '11111111-1111-4111-8111-111111111111',
  name: 'Application greeting',
  version: {
    universalIdentifier: '22222222-2222-4222-8222-222222222222',
    trigger: {
      universalIdentifier: '33333333-3333-4333-8333-333333333333',
      type: 'MANUAL',
      nextStepIds: ['44444444-4444-4444-8444-444444444444'],
    },
    steps: [
      {
        universalIdentifier: '44444444-4444-4444-8444-444444444444',
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

describe('defineWorkflow POC', () => {
  it('accepts a portable manual workflow without workspace IDs', () => {
    expect(defineWorkflow(workflow)).toMatchObject({
      success: true,
      config: workflow,
      errors: [],
    });
  });

  it('is discovered by the application manifest builder', () => {
    expect(extractDefineEntity('export default defineWorkflow({});')).toBe(
      TargetFunction.DefineWorkflow,
    );
  });

  it.each(['missing', 'cycle', 'unreachable', 'duplicate', 'unsupported'])(
    'rejects %s definitions before installation',
    (problem) => {
      const invalid = structuredClone(workflow);
      const step = invalid.version.steps[0];
      if (problem === 'missing')
        step.nextStepIds = ['66666666-6666-4666-8666-666666666666'];
      if (problem === 'cycle') step.nextStepIds = [step.universalIdentifier];
      if (problem === 'unreachable') invalid.version.trigger.nextStepIds = [];
      if (problem === 'duplicate')
        invalid.version.universalIdentifier = invalid.universalIdentifier;
      if (problem === 'unsupported')
        Object.assign(invalid.version.trigger, { type: 'CRON' });
      expect(defineWorkflow(invalid).success).toBe(false);
    },
  );
});

const BRANCH_ID = '77777777-7777-4777-8777-777777777777';
const BODY_ID = '88888888-8888-4888-8888-888888888888';
const FIRST_STEP_ID = workflow.version.steps[0].universalIdentifier;

const branchingWorkflow = (type: 'IF_ELSE' | 'ITERATOR'): WorkflowManifest => ({
  ...workflow,
  version: {
    ...workflow.version,
    steps: [
      ...(type === 'IF_ELSE'
        ? [
            {
              universalIdentifier: FIRST_STEP_ID,
              name: 'Choose',
              type: 'IF_ELSE' as const,
              nextStepIds: [],
              input: {
                stepFilters: [],
                stepFilterGroups: [],
                branches: [
                  { id: 'first', nextStepIds: [BRANCH_ID] },
                  { id: 'otherwise', nextStepIds: [BODY_ID] },
                ],
              },
            },
          ]
        : [
            {
              universalIdentifier: FIRST_STEP_ID,
              name: 'Repeat',
              type: 'ITERATOR' as const,
              nextStepIds: [BRANCH_ID],
              input: { items: ['one', 'two'], initialLoopStepIds: [BODY_ID] },
            },
          ]),
      {
        universalIdentifier: BRANCH_ID,
        name: 'After',
        type: 'EMPTY',
        input: {},
        nextStepIds: [],
      },
      {
        universalIdentifier: BODY_ID,
        name: 'Inside',
        type: 'EMPTY',
        input: {},
        nextStepIds: [],
      },
    ],
  },
});

describe('defineWorkflow action graphs', () => {
  it.each(['IF_ELSE', 'ITERATOR'] as const)(
    'accepts steps reachable only through %s edges',
    (type) => {
      expect(defineWorkflow(branchingWorkflow(type)).success).toBe(true);
    },
  );

  it.each(['IF_ELSE', 'ITERATOR'] as const)(
    'rejects missing and cyclic %s edges',
    (type) => {
      const missing = branchingWorkflow(type);
      missing.version.steps.pop();
      expect(defineWorkflow(missing).success).toBe(false);
      const cyclic = branchingWorkflow(type);
      cyclic.version.steps[2].nextStepIds = [FIRST_STEP_ID];
      expect(defineWorkflow(cyclic).success).toBe(false);
    },
  );

  it('validates each action input instead of accepting arbitrary configuration', () => {
    const invalid = structuredClone(workflow);
    Object.assign(invalid.version.steps[0], {
      type: 'HTTP_REQUEST',
      input: { method: 'BOGUS' },
    });
    expect(defineWorkflow(invalid).success).toBe(false);
  });
});
