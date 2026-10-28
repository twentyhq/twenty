import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
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

const compute = ({
  workflows = MANIFEST.workflows ?? [],
  fromAllFlatEntityMaps = createEmptyAllFlatEntityMaps(),
  isWorkspaceCustomApplication = false,
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
    isWorkspaceCustomApplication,
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

  describe('workspace custom application', () => {
    const WORKFLOW_UNIVERSAL_IDENTIFIER =
      '33333333-3333-4333-8333-333333333333';
    const LEGACY_WORKFLOW_ID = '77777777-7777-4777-8777-777777777777';

    const publishedFromBuilder = () => {
      const published = compute({ isWorkspaceCustomApplication: true });
      const workflow = published.flatWorkflowMaps.byUniversalIdentifier[
        WORKFLOW_UNIVERSAL_IDENTIFIER
      ] as UniversalFlatWorkflow & FlatWorkflow;

      published.flatWorkflowMaps.byUniversalIdentifier[
        WORKFLOW_UNIVERSAL_IDENTIFIER
      ] = {
        ...workflow,
        versionDefinitionHash: null,
        lastPublishedVersionId: 'legacy-workflow-version-id',
        workspaceWorkflowId: LEGACY_WORKFLOW_ID,
      };

      return { published, version: workflow.flatUniversalWorkflowVersion };
    };
    const syncedWorkflow = (maps: ReturnType<typeof compute>) =>
      maps.flatWorkflowMaps.byUniversalIdentifier[
        WORKFLOW_UNIVERSAL_IDENTIFIER
      ] as UniversalFlatWorkflow;

    it('keeps the active version and its pointers when the definition matches it', () => {
      const { published, version } = publishedFromBuilder();

      const workflow = syncedWorkflow(
        compute({
          fromAllFlatEntityMaps: published,
          isWorkspaceCustomApplication: true,
        }),
      );

      expect(workflow).toMatchObject({
        versionDefinitionHash: null,
        lastPublishedVersionId: 'legacy-workflow-version-id',
        lastPublishedCoreWorkflowVersionId: version?.id,
      });
      expect(workflow.flatUniversalWorkflowVersion).toEqual(version);
    });

    it('publishes a changed definition as a new version of the workflow', () => {
      const { published, version } = publishedFromBuilder();
      const workflows = structuredClone(MANIFEST.workflows ?? []);
      const [step] = workflows[0]?.version.steps ?? [];

      if (!isDefined(step)) {
        throw new Error('Expected step');
      }
      step.name = 'Changed';

      const workflow = syncedWorkflow(
        compute({
          workflows,
          fromAllFlatEntityMaps: published,
          isWorkspaceCustomApplication: true,
        }),
      );

      expect(workflow.flatUniversalWorkflowVersion).toMatchObject({
        status: 'ACTIVE',
        workflowId: LEGACY_WORKFLOW_ID,
        steps: [{ name: 'Changed' }],
      });
      expect(workflow.flatUniversalWorkflowVersion?.id).not.toBe(version?.id);
      expect(
        workflow.flatUniversalWorkflowVersion?.universalIdentifier,
      ).not.toBe(version?.universalIdentifier);
      expect(workflow).toMatchObject({
        lastPublishedVersionId: null,
        lastPublishedCoreWorkflowVersionId:
          workflow.flatUniversalWorkflowVersion?.id,
      });
      expect(workflow.versionDefinitionHash).toEqual(expect.any(String));
    });
  });
});
