import {
  getSystemViewFieldUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findStandardWorkflowRunIndexWorkflowVersionViewFields } from 'src/database/commands/upgrade-version-command/2-47/utils/find-standard-workflow-run-index-workflow-version-view-fields.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const RUNS_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workflowRun.views.allWorkflowRuns.universalIdentifier;
const WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workflowRun.fields.workflowVersion.universalIdentifier;

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-10-01T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const runsIndexView =
  allFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
    RUNS_INDEX_VIEW_UNIVERSAL_IDENTIFIER
  ];

const standardRunsIndexViewFields = Object.values(
  allFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
).filter(
  (flatViewField): flatViewField is FlatViewField =>
    flatViewField?.viewUniversalIdentifier ===
    RUNS_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
);

if (!isDefined(runsIndexView) || standardRunsIndexViewFields.length === 0) {
  throw new Error('Standard workflow runs INDEX view missing');
}

const LEGACY_WORKFLOW_VERSION_VIEW_FIELD: FlatViewField = {
  ...standardRunsIndexViewFields[0],
  id: '20202020-3333-4333-8333-333333333333',
  universalIdentifier: getSystemViewFieldUniversalIdentifier({
    fieldMetadataApplicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier: RUNS_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
    fieldMetadataUniversalIdentifier:
      WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
  }),
  fieldMetadataUniversalIdentifier: WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
  position: 5,
};

const buildWorkspaceFlatMaps = (runsIndexViewFields: FlatViewField[]) => ({
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

describe('findStandardWorkflowRunIndexWorkflowVersionViewFields', () => {
  it('finds the standard "Workflow version" column of the runs index', () => {
    expect(
      findStandardWorkflowRunIndexWorkflowVersionViewFields(
        buildWorkspaceFlatMaps([
          ...standardRunsIndexViewFields,
          LEGACY_WORKFLOW_VERSION_VIEW_FIELD,
        ]),
      ),
    ).toEqual([LEGACY_WORKFLOW_VERSION_VIEW_FIELD]);
  });

  it('finds nothing on a runs index without the column', () => {
    expect(
      findStandardWorkflowRunIndexWorkflowVersionViewFields(
        buildWorkspaceFlatMaps(standardRunsIndexViewFields),
      ),
    ).toEqual([]);
  });

  it('leaves a column added by the workspace', () => {
    expect(
      findStandardWorkflowRunIndexWorkflowVersionViewFields(
        buildWorkspaceFlatMaps([
          ...standardRunsIndexViewFields,
          {
            ...LEGACY_WORKFLOW_VERSION_VIEW_FIELD,
            applicationUniversalIdentifier: 'workspace-custom-application',
          },
        ]),
      ),
    ).toEqual([]);
  });
});
