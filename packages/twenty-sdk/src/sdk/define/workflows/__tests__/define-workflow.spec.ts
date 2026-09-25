import { resolve } from 'node:path';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
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

  it('builds the example application with its workflow and exposed function', async () => {
    const { manifest, errors } = await buildManifest(
      resolve(process.cwd(), '../twenty-apps/fixtures/workflow-poc-app'),
    );
    expect(errors).toEqual([]);
    expect(manifest?.workflows).toHaveLength(1);
    expect(manifest?.logicFunctions).toHaveLength(1);
    expect(
      manifest?.workflows?.[0].version.steps[0]
        .logicFunctionUniversalIdentifier,
    ).toBe(manifest?.logicFunctions[0].universalIdentifier);
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
