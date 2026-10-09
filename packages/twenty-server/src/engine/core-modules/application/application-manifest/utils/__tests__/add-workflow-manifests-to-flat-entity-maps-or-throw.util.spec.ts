import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { addWorkflowManifestsToFlatEntityMapsOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/add-workflow-manifests-to-flat-entity-maps-or-throw.util';
import { isDefined } from 'twenty-shared/utils';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';

const MANIFEST = buildBaseManifest({
  appId: '11111111-1111-4111-8111-111111111111',
  roleId: '22222222-2222-4222-8222-222222222222',
  overrides: {
    workflows: [
      {
        universalIdentifier: '33333333-3333-4333-8333-333333333333',
        name: 'Workflow',
        version: {
          trigger: {
            universalIdentifier: '55555555-5555-4555-8555-555555555555',
            type: 'MANUAL',
            nextStepIds: ['66666666-6666-4666-8666-666666666666'],
          },
          steps: [
            {
              universalIdentifier: '66666666-6666-4666-8666-666666666666',
              type: 'EMPTY',
              name: 'Finish',
              input: {},
              nextStepIds: [],
            },
          ],
        },
      },
    ],
  },
});

describe('application workflow installation gate', () => {
  it.each([undefined, false])(
    'rejects workflows when the flag is %s',
    (isApplicationWorkflowsEnabled) => {
      expect(() =>
        addWorkflowManifestsToFlatEntityMapsOrThrow({
          workflows: MANIFEST.workflows ?? [],
          ownerFlatApplication: {
            id: MANIFEST.application.universalIdentifier,
            universalIdentifier: MANIFEST.application.universalIdentifier,
          },
          fromAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
          toAllUniversalFlatEntityMaps: createEmptyAllFlatEntityMaps(),
          existingAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
          idByUniversalIdentifierByMetadataName: {},
          isApplicationWorkflowsEnabled,
          now: '2026-09-28T00:00:00.000Z',
        }),
      ).toThrow('Application workflows are not enabled');
    },
  );
});

const compute = ({
  workflows = MANIFEST.workflows ?? [],
  fromAllFlatEntityMaps = createEmptyAllFlatEntityMaps(),
} = {}) => {
  for (const workflow of Object.values(
    fromAllFlatEntityMaps.flatWorkflowMaps.byUniversalIdentifier,
  )) {
    const version = (workflow as UniversalFlatWorkflow | undefined)
      ?.flatUniversalWorkflowVersion;
    if (isDefined(version)) {
      fromAllFlatEntityMaps.flatWorkflowVersionMaps.byUniversalIdentifier[
        version.universalIdentifier
      ] = version as FlatWorkflowVersion;
    }
  }
  const toAllUniversalFlatEntityMaps = createEmptyAllFlatEntityMaps();

  addWorkflowManifestsToFlatEntityMapsOrThrow({
    workflows,
    ownerFlatApplication: {
      id: MANIFEST.application.universalIdentifier,
      universalIdentifier: MANIFEST.application.universalIdentifier,
    },
    fromAllFlatEntityMaps,
    toAllUniversalFlatEntityMaps,
    existingAllFlatEntityMaps: fromAllFlatEntityMaps,
    idByUniversalIdentifierByMetadataName: {},
    isApplicationWorkflowsEnabled: true,
    now: '2026-09-28T00:00:00.000Z',
  });

  return toAllUniversalFlatEntityMaps;
};

describe('application workflow manifest updates', () => {
  it('preserves workflow and version identity when updating the definition', () => {
    const before = compute();
    const workflows = structuredClone(MANIFEST.workflows ?? []);
    const workflow = workflows[0];
    if (!isDefined(workflow)) {
      throw new Error('Expected workflow');
    }
    workflow.name = 'Updated';

    const after = compute({ workflows, fromAllFlatEntityMaps: before });
    expect(
      after.flatWorkflowMaps.byUniversalIdentifier[
        workflow.universalIdentifier
      ],
    ).toMatchObject({
      id: before.flatWorkflowMaps.byUniversalIdentifier[
        workflow.universalIdentifier
      ]?.id,
      name: 'Updated',
    });
    expect(after.flatWorkflowVersionMaps.byUniversalIdentifier).toEqual({});
    expect(
      (
        after.flatWorkflowMaps.byUniversalIdentifier[
          workflow.universalIdentifier
        ] as UniversalFlatWorkflow
      ).flatUniversalWorkflowVersion?.id,
    ).toBe(
      (
        before.flatWorkflowMaps.byUniversalIdentifier[
          workflow.universalIdentifier
        ] as UniversalFlatWorkflow
      ).flatUniversalWorkflowVersion?.id,
    );
  });

  it('leaves an omitted workflow out of the target maps', () => {
    const before = compute();
    const after = compute({ workflows: [], fromAllFlatEntityMaps: before });

    expect(after.flatWorkflowMaps.byUniversalIdentifier).toEqual({});
  });

  it('adds an application command menu item while the trigger declares where to launch it', () => {
    const [workflow] = MANIFEST.workflows ?? [];
    const launchable = {
      ...workflow,
      version: {
        ...workflow.version,
        trigger: {
          universalIdentifier: workflow.version.trigger.universalIdentifier,
          type: 'MANUAL' as const,
          nextStepIds: workflow.version.trigger.nextStepIds,
          settings: { availability: { type: 'GLOBAL' as const } },
        },
      },
    };

    const withAvailability = compute({ workflows: [launchable] });
    const commandMenuItems = Object.values(
      withAvailability.flatCommandMenuItemMaps.byUniversalIdentifier,
    );
    const version = (
      withAvailability.flatWorkflowMaps.byUniversalIdentifier[
        workflow.universalIdentifier
      ] as UniversalFlatWorkflow | undefined
    )?.flatUniversalWorkflowVersion;

    expect(commandMenuItems).toHaveLength(1);
    expect(commandMenuItems[0]).toMatchObject({
      applicationUniversalIdentifier: MANIFEST.application.universalIdentifier,
      label: workflow.name,
      coreWorkflowVersionId: version?.id,
    });

    const withoutAvailability = compute({
      workflows: [workflow],
      fromAllFlatEntityMaps: withAvailability,
    });

    expect(
      withoutAvailability.flatCommandMenuItemMaps.byUniversalIdentifier,
    ).toEqual({});
  });

  it('rejects unknown record fields and update selections in one error', () => {
    const objectUniversalIdentifier = '88888888-8888-4888-8888-888888888888';
    const existing = createEmptyAllFlatEntityMaps();
    existing.flatObjectMetadataMaps.byUniversalIdentifier[
      objectUniversalIdentifier
    ] = {
      universalIdentifier: objectUniversalIdentifier,
      applicationId: '99999999-9999-4999-8999-999999999999',
      nameSingular: 'company',
    } as FlatObjectMetadata;
    const workflows = structuredClone(MANIFEST.workflows ?? []);
    const workflow = workflows[0];
    if (!isDefined(workflow)) {
      throw new Error('Expected workflow');
    }
    workflow.version.steps = [
      {
        universalIdentifier: '66666666-6666-4666-8666-666666666666',
        name: 'Update',
        type: 'UPDATE_RECORD',
        nextStepIds: [],
        input: {
          objectUniversalIdentifier,
          objectRecordId: 'record',
          objectRecord: { missing: true },
          fieldsToUpdate: ['missing'],
        },
      },
    ];

    expect(() =>
      compute({ workflows, fromAllFlatEntityMaps: existing }),
    ).toThrow(/unknown record field missing.*fieldsToUpdate/);
  });
});
