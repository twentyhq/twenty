import { type WorkflowManifest } from 'twenty-shared/application';

import { fromWorkflowManifestToCoreDefinitionsOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-manifest-to-core-definitions-or-throw.util';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

const WORKFLOW_ID = '11111111-1111-4111-8111-111111111111';
const VERSION_ID = '22222222-2222-4222-8222-222222222222';
const TRIGGER_ID = '33333333-3333-4333-8333-333333333333';
const STEP_ID = '44444444-4444-4444-8444-444444444444';
const FUNCTION_ID = '55555555-5555-4555-8555-555555555555';
const APPLICATION_ID = '66666666-6666-4666-8666-666666666666';
const manifest: WorkflowManifest = {
  universalIdentifier: WORKFLOW_ID,
  name: 'Greeting',
  version: {
    universalIdentifier: VERSION_ID,
    trigger: {
      universalIdentifier: TRIGGER_ID,
      type: 'MANUAL',
      nextStepIds: [STEP_ID],
    },
    steps: [
      {
        universalIdentifier: STEP_ID,
        name: 'Greet',
        type: 'LOGIC_FUNCTION',
        logicFunctionUniversalIdentifier: FUNCTION_ID,
        input: { greeting: 'Before' },
        nextStepIds: [],
      },
    ],
  },
};
const options = {
  manifest,
  applicationUniversalIdentifier: APPLICATION_ID,
  now: '2026-09-25T10:00:00.000Z',
  logicFunctionIdByUniversalIdentifier: new Map([
    [FUNCTION_ID, '77777777-7777-4777-8777-777777777777'],
  ]),
};

describe('application workflow definitions', () => {
  it('creates one active core version without workspace projections', () => {
    const { workflow, version } =
      fromWorkflowManifestToCoreDefinitionsOrThrow(options);
    expect(workflow.lastPublishedCoreWorkflowVersionId).toBe(version.id);
    expect(version.coreWorkflowId).toBe(workflow.id);
    expect(workflow.workspaceWorkflowId).toBeNull();
    expect(version.workspaceWorkflowVersionId).toBeNull();
    expect(version.status).toBe('ACTIVE');
    expect(version.steps?.[0].settings.input).toEqual({
      logicFunctionId:
        options.logicFunctionIdByUniversalIdentifier.get(FUNCTION_ID),
      logicFunctionInput: { greeting: 'Before' },
    });
  });

  it('updates the same version and keeps graph identity across updates', () => {
    const before = fromWorkflowManifestToCoreDefinitionsOrThrow(options);
    const existingWorkflow: FlatWorkflow = {
      ...before.workflow,
      workspaceId: APPLICATION_ID,
      applicationId: APPLICATION_ID,
    };
    const existingVersion: FlatWorkflowVersion = {
      ...before.version,
      workspaceId: APPLICATION_ID,
      applicationId: APPLICATION_ID,
    };
    const changed = structuredClone(manifest);
    changed.version.steps[0].input.greeting = 'After';
    const after = fromWorkflowManifestToCoreDefinitionsOrThrow({
      ...options,
      manifest: changed,
      existingWorkflow,
      existingVersion,
    });
    expect(after.workflow.id).toBe(before.workflow.id);
    expect(after.version.id).toBe(before.version.id);
    expect(after.version.steps?.[0].id).toBe(before.version.steps?.[0].id);
    expect(after.version.steps?.[0].settings.input).toMatchObject({
      logicFunctionInput: { greeting: 'After' },
    });
    expect(before.version.steps?.[0].settings.input).toMatchObject({
      logicFunctionInput: { greeting: 'Before' },
    });
  });

  it('resolves the same definition to different workspace function IDs', () => {
    const first = fromWorkflowManifestToCoreDefinitionsOrThrow(options);
    const second = fromWorkflowManifestToCoreDefinitionsOrThrow({
      ...options,
      logicFunctionIdByUniversalIdentifier: new Map([
        [FUNCTION_ID, '88888888-8888-4888-8888-888888888888'],
      ]),
    });
    expect(first.version.steps?.[0].settings.input).not.toEqual(
      second.version.steps?.[0].settings.input,
    );
    expect(first.version.universalIdentifier).toBe(
      second.version.universalIdentifier,
    );
    expect(first.version.id).not.toBe(second.version.id);
  });

  it('refuses missing or non-exposed application functions', () => {
    expect(() =>
      fromWorkflowManifestToCoreDefinitionsOrThrow({
        ...options,
        logicFunctionIdByUniversalIdentifier: new Map(),
      }),
    ).toThrow('missing application workflow action');
  });

  it('rejects an unsupported trigger on the server too', () => {
    const invalid = structuredClone(manifest);
    Object.assign(invalid.version.trigger, { type: 'WEBHOOK' });
    expect(() =>
      fromWorkflowManifestToCoreDefinitionsOrThrow({
        ...options,
        manifest: invalid,
      }),
    ).toThrow();
  });
});
