import { addWorkflowManifestsToFlatEntityMapsOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/add-workflow-manifests-to-flat-entity-maps-or-throw.util';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
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
          universalIdentifier: '44444444-4444-4444-8444-444444444444',
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
          ownerFlatApplication: {} as FlatApplication,
          fromAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
          toAllUniversalFlatEntityMaps: createEmptyAllFlatEntityMaps(),
          existingAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
          isApplicationWorkflowsEnabled,
          inferDeletionFromMissingEntities: true,
          now: '2026-09-28T00:00:00.000Z',
        }),
      ).toThrow('Application workflows are not enabled');
    },
  );
});

const compute = ({
  workflows = MANIFEST.workflows ?? [],
  fromAllFlatEntityMaps = createEmptyAllFlatEntityMaps(),
  inferDeletionFromMissingEntities = true,
} = {}) => {
  const toAllUniversalFlatEntityMaps = createEmptyAllFlatEntityMaps();

  addWorkflowManifestsToFlatEntityMapsOrThrow({
    workflows,
    ownerFlatApplication: {
      id: MANIFEST.application.universalIdentifier,
      universalIdentifier: MANIFEST.application.universalIdentifier,
    } as FlatApplication,
    fromAllFlatEntityMaps,
    toAllUniversalFlatEntityMaps,
    existingAllFlatEntityMaps: fromAllFlatEntityMaps,
    isApplicationWorkflowsEnabled: true,
    inferDeletionFromMissingEntities,
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
    expect(
      after.flatWorkflowVersionMaps.byUniversalIdentifier[
        workflow.version.universalIdentifier
      ]?.id,
    ).toBe(
      before.flatWorkflowVersionMaps.byUniversalIdentifier[
        workflow.version.universalIdentifier
      ]?.id,
    );
  });

  it('rejects replacing an existing version identifier', () => {
    const before = compute();
    const workflows = structuredClone(MANIFEST.workflows ?? []);
    const workflow = workflows[0];
    if (!isDefined(workflow)) {
      throw new Error('Expected workflow');
    }
    workflow.version.universalIdentifier =
      '77777777-7777-4777-8777-777777777777';

    expect(() => compute({ workflows, fromAllFlatEntityMaps: before })).toThrow(
      'must keep the same version',
    );
  });

  it('rejects deleting a workflow on a full sync', () => {
    expect(() =>
      compute({ workflows: [], fromAllFlatEntityMaps: compute() }),
    ).toThrow('Removing application workflows is not supported');
  });

  it('allows omitted workflows on additive syncs', () => {
    expect(() =>
      compute({
        workflows: [],
        fromAllFlatEntityMaps: compute(),
        inferDeletionFromMissingEntities: false,
      }),
    ).not.toThrow();
  });
});
