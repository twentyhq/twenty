import { isPlainObject } from 'twenty-shared/utils';

const AVAILABILITY_OBJECT_METADATA_ID_KEY = 'availabilityObjectMetadataId';

type CommandMenuItemAvailabilityRow = {
  availabilityObjectMetadataId: string | null;
  availabilityCoreObjectName: string | null;
  overrides: unknown;
};

type OverrideEntryRewrite = {
  entry: Record<string, unknown>;
  hasRemainingAvailabilityOverride: boolean;
};

const removeWorkflowAvailabilityOverride = (
  entry: Record<string, unknown>,
  workflowObjectMetadataId: string,
): OverrideEntryRewrite => {
  if (entry[AVAILABILITY_OBJECT_METADATA_ID_KEY] !== workflowObjectMetadataId) {
    return {
      entry,
      hasRemainingAvailabilityOverride:
        AVAILABILITY_OBJECT_METADATA_ID_KEY in entry,
    };
  }

  const { [AVAILABILITY_OBJECT_METADATA_ID_KEY]: _removed, ...rest } = entry;

  return { entry: rest, hasRemainingAvailabilityOverride: false };
};

// Overrides are either one legacy flat entry or one entry per authoring application.
const rewriteOverrides = (
  overrides: unknown,
  workflowObjectMetadataId: string,
): { overrides: unknown; hasRemainingAvailabilityOverride: boolean } => {
  if (!isPlainObject(overrides)) {
    return { overrides, hasRemainingAvailabilityOverride: false };
  }

  if (AVAILABILITY_OBJECT_METADATA_ID_KEY in overrides) {
    const { entry, hasRemainingAvailabilityOverride } =
      removeWorkflowAvailabilityOverride(overrides, workflowObjectMetadataId);

    return {
      overrides: Object.keys(entry).length > 0 ? entry : null,
      hasRemainingAvailabilityOverride,
    };
  }

  let hasRemainingAvailabilityOverride = false;
  const rewrittenEntries = Object.entries(overrides).flatMap(
    ([author, entry]) => {
      if (!isPlainObject(entry)) {
        return [[author, entry] as const];
      }

      const rewrite = removeWorkflowAvailabilityOverride(
        entry,
        workflowObjectMetadataId,
      );

      hasRemainingAvailabilityOverride ||=
        rewrite.hasRemainingAvailabilityOverride;

      return Object.keys(rewrite.entry).length > 0
        ? [[author, rewrite.entry] as const]
        : [];
    },
  );

  return {
    overrides:
      rewrittenEntries.length > 0 ? Object.fromEntries(rewrittenEntries) : null,
    hasRemainingAvailabilityOverride,
  };
};

// Returns null when the row does not reference the workflow object.
export const rescopeWorkflowCommandMenuItem = ({
  row,
  workflowObjectMetadataId,
}: {
  row: CommandMenuItemAvailabilityRow;
  workflowObjectMetadataId: string;
}): CommandMenuItemAvailabilityRow | null => {
  const { overrides, hasRemainingAvailabilityOverride } = rewriteOverrides(
    row.overrides,
    workflowObjectMetadataId,
  );
  const isBaseTargetingWorkflow =
    row.availabilityObjectMetadataId === workflowObjectMetadataId;

  if (
    !isBaseTargetingWorkflow &&
    JSON.stringify(overrides) === JSON.stringify(row.overrides)
  ) {
    return null;
  }

  if (!isBaseTargetingWorkflow) {
    return { ...row, overrides };
  }

  // An author who re-targeted the item keeps their choice; only the base scope moves.
  return {
    availabilityObjectMetadataId: null,
    availabilityCoreObjectName: hasRemainingAvailabilityOverride
      ? row.availabilityCoreObjectName
      : 'workflow',
    overrides,
  };
};
