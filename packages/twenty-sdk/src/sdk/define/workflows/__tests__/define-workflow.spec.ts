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

describe('defineWorkflow', () => {
  it('accepts a portable manual workflow without workspace IDs', () => {
    expect(defineWorkflow(workflow)).toMatchObject({
      success: true,
      config: workflow,
      errors: [],
    });
  });

  it('rejects raw GraphQL ordering in portable record queries', () => {
    const invalid: WorkflowManifest = {
      ...workflow,
      version: {
        ...workflow.version,
        steps: [
          {
            universalIdentifier: workflow.version.steps[0].universalIdentifier,
            name: 'Find records',
            type: 'FIND_RECORDS',
            nextStepIds: [],
            input: { objectUniversalIdentifier: workflow.universalIdentifier },
          },
        ],
      },
    };
    Object.assign(invalid.version.steps[0].input, {
      orderBy: { gqlOperationOrderBy: [{ workspaceField: 'AscNullsLast' }] },
    });
    const result = defineWorkflow(invalid);
    expect(result.success).toBe(false);
    expect(result.errors.join(' ')).toContain('gqlOperationOrderBy');
  });

  it('is discovered by the application manifest builder', () => {
    expect(extractDefineEntity('export default defineWorkflow({});')).toBe(
      TargetFunction.DefineWorkflow,
    );
  });

  it.each([
    ['missing', 'references a non-existent step'],
    ['cycle', 'Workflow contains a cycle'],
    ['unreachable', 'is not reachable from the trigger'],
    ['duplicate', 'must have distinct universal identifiers'],
    ['unsupported', 'version.trigger.type: Invalid input: expected "MANUAL"'],
    ['code', 'version.steps.0.type: Unsupported step type'],
    ['email', 'version.steps.0.type: Unsupported step type'],
    ['calendar', 'version.steps.0.type: Unsupported step type'],
  ])('rejects %s definitions before installation', (problem, error) => {
    const invalid = structuredClone(workflow);
    const step = invalid.version.steps[0];
    if (problem === 'missing') {
      step.nextStepIds = ['66666666-6666-4666-8666-666666666666'];
    }
    if (problem === 'cycle') {
      step.nextStepIds = [step.universalIdentifier];
    }
    if (problem === 'unreachable') {
      invalid.version.steps.push({
        ...step,
        universalIdentifier: '66666666-6666-4666-8666-666666666666',
      });
    }
    if (problem === 'duplicate') {
      invalid.version.trigger.universalIdentifier = invalid.universalIdentifier;
    }
    if (problem === 'unsupported') {
      Object.assign(invalid.version.trigger, { type: 'CRON' });
    }
    if (problem === 'code') {
      Object.assign(step, { type: 'CODE' });
    }
    if (problem === 'email') {
      Object.assign(step, { type: 'SEND_EMAIL' });
    }
    if (problem === 'calendar') {
      Object.assign(step, { type: 'CREATE_CALENDAR_EVENT' });
    }
    const result = defineWorkflow(invalid);
    expect(result.success).toBe(false);
    expect(result.errors).toEqual([expect.stringMatching(/^\S/)]);
    expect(result.errors[0]).toContain(error);
  });
});
