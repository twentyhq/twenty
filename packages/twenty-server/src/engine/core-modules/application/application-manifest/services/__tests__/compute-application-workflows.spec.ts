import {
  type Manifest,
  type WorkflowManifest,
} from 'twenty-shared/application';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ComputeApplicationManifestAllUniversalFlatEntityMapsService } from 'src/engine/core-modules/application/application-manifest/services/compute-application-manifest-all-universal-flat-entity-maps.service';
import { buildAllFlatEntityOperationRecordByMetadataNameFromFromTo } from 'src/engine/core-modules/application/application-manifest/utils/build-all-flat-entity-operation-record-by-metadata-name-from-from-to.util';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';

const APP_ID = '66666666-6666-4666-8666-666666666666';
const WORKFLOW_ID = '11111111-1111-4111-8111-111111111111';
const VERSION_ID = '22222222-2222-4222-8222-222222222222';
const STEP_ID = '44444444-4444-4444-8444-444444444444';
const FUNCTION_ID = '55555555-5555-4555-8555-555555555555';
const WORKFLOW: WorkflowManifest = {
  universalIdentifier: WORKFLOW_ID,
  name: 'Greeting',
  version: {
    universalIdentifier: VERSION_ID,
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
        logicFunctionUniversalIdentifier: FUNCTION_ID,
        input: { greeting: 'Before' },
        nextStepIds: [],
      },
    ],
  },
};
const MANIFEST: Manifest = {
  application: {
    universalIdentifier: APP_ID,
    defaultRoleUniversalIdentifier: APP_ID,
    displayName: 'Test',
    description: 'Test',
    applicationVariables: {},
    packageJsonChecksum: null,
    yarnLockChecksum: null,
  },
  roles: [],
  permissionFlags: [],
  skills: [],
  agents: [],
  objects: [],
  fields: [],
  logicFunctions: [
    {
      universalIdentifier: FUNCTION_ID,
      name: 'Greet',
      sourceHandlerPath: 'greet.ts',
      builtHandlerPath: 'greet.mjs',
      builtHandlerChecksum: '',
      handlerName: 'handler',
      workflowActionTriggerSettings: { label: 'Greet', icon: 'IconHandStop' },
    },
  ],
  frontComponents: [],
  publicAssets: [],
  views: [],
  viewFields: [],
  navigationMenuItems: [],
  pageLayouts: [],
  pageLayoutTabs: [],
  pageLayoutWidgets: [],
  commandMenuItems: [],
  timelineActivityTypes: [],
  settingsMenuItems: [],
  workflows: [WORKFLOW],
};
const ownerFlatApplication = Object.assign(new ApplicationEntity(), {
  id: APP_ID,
  universalIdentifier: APP_ID,
  sourceType: ApplicationRegistrationSourceType.LOCAL,
});
const service = new ComputeApplicationManifestAllUniversalFlatEntityMapsService(
  Object.create(SecretEncryptionService.prototype),
);
const options = {
  manifest: MANIFEST,
  ownerFlatApplication,
  fromAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
  isLogicFunctionPrebuiltModeEnabled: false,
  now: '2026-09-25T10:00:00.000Z',
  workspaceId: APP_ID,
};
const buildOptions = {
  isSystemBuild: false,
  applicationUniversalIdentifier: APP_ID,
};

describe('application workflow synchronization', () => {
  it('retains preallocated IDs through migration planning for a new function and workflow', () => {
    const desired = service.compute(options);
    const operations =
      buildAllFlatEntityOperationRecordByMetadataNameFromFromTo({
        fromAllFlatEntityMaps: options.fromAllFlatEntityMaps,
        toAllUniversalFlatEntityMaps: desired,
        buildOptions,
      });
    const workflow = operations.workflow?.flatEntityToCreate[WORKFLOW_ID];
    const version = operations.workflowVersion?.flatEntityToCreate[VERSION_ID];
    const logicFunction =
      operations.logicFunction?.flatEntityToCreate[FUNCTION_ID];
    expect(workflow?.id).toEqual(expect.any(String));
    expect(version?.coreWorkflowId).toBe(workflow?.id);
    expect(workflow?.lastPublishedCoreWorkflowVersionId).toBe(version?.id);
    expect(version?.steps?.[0].settings.input).toMatchObject({
      logicFunctionId: logicFunction?.id,
    });
  });

  it('is idempotent and updates only the single version when its graph changes', () => {
    const installed = service.compute(options);
    const unchanged = service.compute({
      ...options,
      fromAllFlatEntityMaps: installed,
      now: '2026-09-26T10:00:00.000Z',
    });
    expect(
      buildAllFlatEntityOperationRecordByMetadataNameFromFromTo({
        fromAllFlatEntityMaps: installed,
        toAllUniversalFlatEntityMaps: unchanged,
        buildOptions,
      }),
    ).toEqual({});
    const manifest = structuredClone(MANIFEST);
    manifest.workflows![0].version.steps[0].input.greeting = 'After';
    const updated = service.compute({
      ...options,
      manifest,
      fromAllFlatEntityMaps: installed,
    });
    const operations =
      buildAllFlatEntityOperationRecordByMetadataNameFromFromTo({
        fromAllFlatEntityMaps: installed,
        toAllUniversalFlatEntityMaps: updated,
        buildOptions,
      });
    expect(Object.keys(operations)).toEqual(['workflowVersion']);
    expect(operations.workflowVersion?.flatEntityToCreate).toEqual({});
    expect(operations.workflowVersion?.flatEntityToDelete).toEqual({});
    expect(
      operations.workflowVersion?.flatEntityToUpdate[VERSION_ID],
    ).toMatchObject({
      id: installed.flatWorkflowVersionMaps.byUniversalIdentifier[VERSION_ID]
        ?.id,
    });
    expect(
      installed.flatWorkflowVersionMaps.byUniversalIdentifier[VERSION_ID]
        ?.steps?.[0].settings.input,
    ).toMatchObject({ logicFunctionInput: { greeting: 'Before' } });
  });

  it('rejects removing a workflow or replacing its version identity', () => {
    const installed = service.compute(options);
    expect(() =>
      service.compute({
        ...options,
        fromAllFlatEntityMaps: installed,
        manifest: { ...MANIFEST, workflows: [] },
      }),
    ).toThrow('Removing application workflows');
    const manifest = structuredClone(MANIFEST);
    manifest.workflows![0].version.universalIdentifier =
      '77777777-7777-4777-8777-777777777777';
    expect(() =>
      service.compute({
        ...options,
        fromAllFlatEntityMaps: installed,
        manifest,
      }),
    ).toThrow('same version universal identifier');
  });

  it('rejects references to functions not exposed as application workflow actions', () => {
    const manifest = structuredClone(MANIFEST);
    delete manifest.logicFunctions[0].workflowActionTriggerSettings;
    expect(() => service.compute({ ...options, manifest })).toThrow(
      'missing application workflow action',
    );
  });
});
