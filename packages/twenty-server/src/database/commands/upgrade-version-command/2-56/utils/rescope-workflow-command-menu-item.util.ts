import { isPlainObject } from 'twenty-shared/utils';

const AVAILABILITY_OBJECT_METADATA_ID_KEY = 'availabilityObjectMetadataId';
const AVAILABILITY_CORE_OBJECT_NAME_KEY = 'availabilityCoreObjectName';
const WORKFLOW_CORE_OBJECT_NAME = 'workflow';

type CommandMenuItemAvailabilityRow = {
  availabilityObjectMetadataId: string | null;
  availabilityCoreObjectName: string | null;
  overrides: unknown;
};

const rescopeOverrideEntry = ({
  entry,
  workflowObjectMetadataId,
  isBaseTargetingWorkflow,
}: {
  entry: Record<string, unknown>;
  workflowObjectMetadataId: string;
  isBaseTargetingWorkflow: boolean;
}): Record<string, unknown> => {
  if (!(AVAILABILITY_OBJECT_METADATA_ID_KEY in entry)) {
    return entry;
  }

  const {
    [AVAILABILITY_OBJECT_METADATA_ID_KEY]: availabilityObjectMetadataId,
    ...rest
  } = entry;

  if (availabilityObjectMetadataId === workflowObjectMetadataId) {
    return isBaseTargetingWorkflow
      ? rest
      : {
          ...rest,
          [AVAILABILITY_OBJECT_METADATA_ID_KEY]: null,
          [AVAILABILITY_CORE_OBJECT_NAME_KEY]: WORKFLOW_CORE_OBJECT_NAME,
        };
  }

  // The base moves to the workflow core object, which this author's target must still win over.
  return isBaseTargetingWorkflow
    ? { ...entry, [AVAILABILITY_CORE_OBJECT_NAME_KEY]: null }
    : entry;
};

// Overrides are either one legacy flat entry or one entry per authoring application.
const rescopeOverrides = ({
  overrides,
  workflowObjectMetadataId,
  isBaseTargetingWorkflow,
}: {
  overrides: unknown;
  workflowObjectMetadataId: string;
  isBaseTargetingWorkflow: boolean;
}): unknown => {
  if (!isPlainObject(overrides)) {
    return overrides;
  }

  if (AVAILABILITY_OBJECT_METADATA_ID_KEY in overrides) {
    const entry = rescopeOverrideEntry({
      entry: overrides,
      workflowObjectMetadataId,
      isBaseTargetingWorkflow,
    });

    return Object.keys(entry).length > 0 ? entry : null;
  }

  const rescopedEntries = Object.entries(overrides).flatMap(
    ([author, entry]) => {
      if (!isPlainObject(entry)) {
        return [[author, entry] as const];
      }

      const rescopedEntry = rescopeOverrideEntry({
        entry,
        workflowObjectMetadataId,
        isBaseTargetingWorkflow,
      });

      return Object.keys(rescopedEntry).length > 0
        ? [[author, rescopedEntry] as const]
        : [];
    },
  );

  return rescopedEntries.length > 0
    ? Object.fromEntries(rescopedEntries)
    : null;
};

export const rescopeWorkflowCommandMenuItem = ({
  row,
  workflowObjectMetadataId,
}: {
  row: CommandMenuItemAvailabilityRow;
  workflowObjectMetadataId: string;
}): CommandMenuItemAvailabilityRow | null => {
  const isBaseTargetingWorkflow =
    row.availabilityObjectMetadataId === workflowObjectMetadataId;
  const overrides = rescopeOverrides({
    overrides: row.overrides,
    workflowObjectMetadataId,
    isBaseTargetingWorkflow,
  });

  if (
    !isBaseTargetingWorkflow &&
    JSON.stringify(overrides) === JSON.stringify(row.overrides)
  ) {
    return null;
  }

  return isBaseTargetingWorkflow
    ? {
        availabilityObjectMetadataId: null,
        availabilityCoreObjectName: WORKFLOW_CORE_OBJECT_NAME,
        overrides,
      }
    : { ...row, overrides };
};
