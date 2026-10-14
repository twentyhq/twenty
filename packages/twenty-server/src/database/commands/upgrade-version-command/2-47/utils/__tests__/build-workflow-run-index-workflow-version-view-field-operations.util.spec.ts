import {
  getSystemViewFieldUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  buildWorkflowRunIndexWorkflowVersionViewFieldOperations,
  type WorkflowRunIndexWorkflowVersionViewFieldFlatMaps,
} from 'src/database/commands/upgrade-version-command/2-47/utils/build-workflow-run-index-workflow-version-view-field-operations.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-10-14T12:00:00.000Z';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';

const WORKFLOW_RUN = STANDARD_OBJECTS.workflowRun;
const RUNS_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  WORKFLOW_RUN.views.allWorkflowRuns.universalIdentifier;
const WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER =
  WORKFLOW_RUN.fields.workflowVersion.universalIdentifier;

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-10-01T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
  },
);

const getOrThrow = <T>(entity: T | undefined, label: string): T => {
  if (!isDefined(entity)) {
    throw new Error(`Standard ${label} missing`);
  }

  return entity;
};

const runsIndexView = getOrThrow(
  allFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
    RUNS_INDEX_VIEW_UNIVERSAL_IDENTIFIER
  ],
  'workflow runs INDEX view',
);

const workflowVersionField = getOrThrow(
  allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
    WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER
  ],
  'workflowRun.workflowVersion field',
);

const standardRunsIndexViewFields = Object.values(
  allFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
).filter(
  (flatViewField): flatViewField is FlatViewField =>
    flatViewField?.viewUniversalIdentifier ===
    RUNS_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
);

const LEGACY_WORKFLOW_VERSION_VIEW_FIELD: FlatViewField = {
  ...getOrThrow(standardRunsIndexViewFields[0], 'runs INDEX view field'),
  id: '20202020-3333-4333-8333-333333333333',
  universalIdentifier: getSystemViewFieldUniversalIdentifier({
    fieldMetadataApplicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier: RUNS_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
    fieldMetadataUniversalIdentifier:
      WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
  }),
  fieldMetadataId: workflowVersionField.id,
  fieldMetadataUniversalIdentifier: WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
  position: 5,
};

const buildWorkspaceFlatMaps = (
  runsIndexViewFields: FlatViewField[],
): WorkflowRunIndexWorkflowVersionViewFieldFlatMaps => ({
  flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
  flatViewMaps: {
    ...allFlatEntityMaps.flatViewMaps,
    byUniversalIdentifier: {
      ...allFlatEntityMaps.flatViewMaps.byUniversalIdentifier,
      [RUNS_INDEX_VIEW_UNIVERSAL_IDENTIFIER]: {
        ...runsIndexView,
        viewFieldUniversalIdentifiers: runsIndexViewFields.map(
          ({ universalIdentifier }) => universalIdentifier,
        ),
      },
    },
  },
  flatViewFieldMaps: {
    ...allFlatEntityMaps.flatViewFieldMaps,
    byUniversalIdentifier: {
      ...allFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
      ...Object.fromEntries(
        runsIndexViewFields.map((flatViewField) => [
          flatViewField.universalIdentifier,
          flatViewField,
        ]),
      ),
    },
  },
});

const WORKSPACE_WITH_COLUMN = buildWorkspaceFlatMaps([
  ...standardRunsIndexViewFields,
  LEGACY_WORKFLOW_VERSION_VIEW_FIELD,
]);

const WORKSPACE_WITHOUT_COLUMN = buildWorkspaceFlatMaps(
  standardRunsIndexViewFields,
);

describe('buildWorkflowRunIndexWorkflowVersionViewFieldOperations', () => {
  it('removes the "Workflow version" column from the runs index', () => {
    expect(
      buildWorkflowRunIndexWorkflowVersionViewFieldOperations({
        flatMaps: WORKSPACE_WITH_COLUMN,
        now: NOW,
        direction: 'up',
      }),
    ).toEqual({
      viewFieldsToCreate: [],
      viewFieldsToDelete: [LEGACY_WORKFLOW_VERSION_VIEW_FIELD],
    });
  });

  it('leaves a runs index without the column untouched', () => {
    expect(
      buildWorkflowRunIndexWorkflowVersionViewFieldOperations({
        flatMaps: WORKSPACE_WITHOUT_COLUMN,
        now: NOW,
        direction: 'up',
      }),
    ).toEqual({ viewFieldsToCreate: [], viewFieldsToDelete: [] });
  });

  it('restores the column after the last one on down', () => {
    const { viewFieldsToCreate, viewFieldsToDelete } =
      buildWorkflowRunIndexWorkflowVersionViewFieldOperations({
        flatMaps: WORKSPACE_WITHOUT_COLUMN,
        now: NOW,
        direction: 'down',
      });

    expect(viewFieldsToDelete).toEqual([]);
    expect(viewFieldsToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier:
          LEGACY_WORKFLOW_VERSION_VIEW_FIELD.universalIdentifier,
        applicationId: TWENTY_STANDARD_APPLICATION_ID,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        viewId: runsIndexView.id,
        viewUniversalIdentifier: RUNS_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
        fieldMetadataId: workflowVersionField.id,
        fieldMetadataUniversalIdentifier:
          WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
        position:
          Math.max(
            ...standardRunsIndexViewFields.map(({ position }) => position),
          ) + 1,
        isVisible: true,
        isSystemSideEffect: runsIndexView.isSystemSideEffect,
        createdAt: NOW,
        deletedAt: null,
      }),
    ]);
  });

  it('does not restore a column that is already there', () => {
    expect(
      buildWorkflowRunIndexWorkflowVersionViewFieldOperations({
        flatMaps: WORKSPACE_WITH_COLUMN,
        now: NOW,
        direction: 'down',
      }),
    ).toEqual({ viewFieldsToCreate: [], viewFieldsToDelete: [] });
  });
});
