import { rescopeWorkflowCommandMenuItem } from 'src/database/commands/upgrade-version-command/2-56/utils/rescope-workflow-command-menu-item.util';

const WORKFLOW_OBJECT_METADATA_ID = 'workflow-object-id';
const COMPANY_OBJECT_METADATA_ID = 'company-object-id';
const STANDARD_APPLICATION = 'standard-application';
const CUSTOM_APPLICATION = 'custom-application';

const rescope = (row: {
  availabilityObjectMetadataId: string | null;
  overrides: Record<string, unknown> | null;
}) =>
  rescopeWorkflowCommandMenuItem({
    row: { ...row, availabilityCoreObjectName: null },
    workflowObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
  });

describe('rescopeWorkflowCommandMenuItem', () => {
  it('moves an item scoped to the workflow object to the workflow core object', () => {
    expect(
      rescope({
        availabilityObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
        overrides: null,
      }),
    ).toEqual({
      availabilityObjectMetadataId: null,
      availabilityCoreObjectName: 'workflow',
      overrides: null,
    });
  });

  it('leaves an item that never references the workflow object untouched', () => {
    expect(
      rescope({
        availabilityObjectMetadataId: COMPANY_OBJECT_METADATA_ID,
        overrides: { [CUSTOM_APPLICATION]: { isPinned: true } },
      }),
    ).toBeNull();
  });

  it('keeps an author override that re-targets the item to another object', () => {
    expect(
      rescope({
        availabilityObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
        overrides: {
          [CUSTOM_APPLICATION]: {
            availabilityObjectMetadataId: COMPANY_OBJECT_METADATA_ID,
          },
        },
      }),
    ).toEqual({
      availabilityObjectMetadataId: null,
      availabilityCoreObjectName: 'workflow',
      overrides: {
        [CUSTOM_APPLICATION]: {
          availabilityObjectMetadataId: COMPANY_OBJECT_METADATA_ID,
          availabilityCoreObjectName: null,
        },
      },
    });
  });

  it('keeps an author override that makes the item global', () => {
    expect(
      rescope({
        availabilityObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
        overrides: {
          [CUSTOM_APPLICATION]: { availabilityObjectMetadataId: null },
        },
      }),
    ).toEqual({
      availabilityObjectMetadataId: null,
      availabilityCoreObjectName: 'workflow',
      overrides: {
        [CUSTOM_APPLICATION]: {
          availabilityObjectMetadataId: null,
          availabilityCoreObjectName: null,
        },
      },
    });
  });

  it('drops redundant workflow targets from every author entry', () => {
    expect(
      rescope({
        availabilityObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
        overrides: {
          [STANDARD_APPLICATION]: {
            availabilityObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
          },
          [CUSTOM_APPLICATION]: {
            availabilityObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
            isPinned: true,
          },
        },
      }),
    ).toEqual({
      availabilityObjectMetadataId: null,
      availabilityCoreObjectName: 'workflow',
      overrides: { [CUSTOM_APPLICATION]: { isPinned: true } },
    });
  });

  it('drops a redundant workflow target from a legacy flat override', () => {
    expect(
      rescope({
        availabilityObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
        overrides: {
          availabilityObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
          label: 'Run',
        },
      }),
    ).toEqual({
      availabilityObjectMetadataId: null,
      availabilityCoreObjectName: 'workflow',
      overrides: { label: 'Run' },
    });
  });

  it('moves an author override targeting the workflow object to the workflow core object', () => {
    expect(
      rescope({
        availabilityObjectMetadataId: COMPANY_OBJECT_METADATA_ID,
        overrides: {
          [CUSTOM_APPLICATION]: {
            availabilityObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
          },
        },
      }),
    ).toEqual({
      availabilityObjectMetadataId: COMPANY_OBJECT_METADATA_ID,
      availabilityCoreObjectName: null,
      overrides: {
        [CUSTOM_APPLICATION]: {
          availabilityObjectMetadataId: null,
          availabilityCoreObjectName: 'workflow',
        },
      },
    });
  });
});
