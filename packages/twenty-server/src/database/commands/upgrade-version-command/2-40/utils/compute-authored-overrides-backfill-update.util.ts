import { type BackfilledOverridesMetadataName } from 'src/database/commands/upgrade-version-command/2-40/constants/legacy-override-entry-property-names-by-metadata-name.constant';
import {
  type AuthoredOverridesRecord,
  isAuthoredOverridesRecord,
  liftLegacyAuthoredOverrides,
} from 'src/database/commands/upgrade-version-command/2-40/utils/lift-legacy-authored-overrides.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';

export type BackfillableFlatEntity = {
  applicationUniversalIdentifier: string;
  isActive: boolean;
  overrides?: unknown;
  universalOverrides?: unknown;
  isSystemSideEffect?: boolean;
};

export type AuthoredOverridesBackfillUpdate = {
  overrides?: unknown;
  universalOverrides?: unknown;
  isActive?: boolean;
};

// The column goes back to the owner's value, true, so the deactivation moves
// into the custom entry unless that entry already speaks: false stays, and a
// true written over the false column since 2.39 now equals the column, so it
// leaves the entry the way the dispatcher would have dropped a revert.
const attributeDeactivationToCustomEntry = ({
  overrides,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  overrides: unknown;
  workspaceCustomApplicationUniversalIdentifier: string;
}): AuthoredOverridesRecord | null => {
  const authoredOverrides = isAuthoredOverridesRecord(overrides)
    ? overrides
    : {};
  const existingEntry =
    authoredOverrides[workspaceCustomApplicationUniversalIdentifier];
  const {
    isActive: entryIsActive,
    ...entryWithoutIsActive
  }: AuthoredOverridesRecord = isAuthoredOverridesRecord(existingEntry)
    ? existingEntry
    : {};
  const entry =
    entryIsActive === true
      ? entryWithoutIsActive
      : { ...entryWithoutIsActive, isActive: false };
  const {
    [workspaceCustomApplicationUniversalIdentifier]: _previousEntry,
    ...otherEntries
  } = authoredOverrides;
  const nextAuthoredOverrides =
    Object.keys(entry).length > 0
      ? { ...otherEntries, [workspaceCustomApplicationUniversalIdentifier]: entry }
      : otherEntries;

  return Object.keys(nextAuthoredOverrides).length > 0
    ? nextAuthoredOverrides
    : null;
};

// Returns the columns to write for one row, or null when the row is already
// in the target shape. A false column on a row the workspace custom
// application overrides rather than owns is a deactivation it wrote before
// 2.40, when deactivations went to the column; a false the engine derives
// (isActiveEngineDerived) is not the workspace's and stays on the column.
export const computeAuthoredOverridesBackfillUpdate = ({
  metadataName,
  flatEntity,
  workspaceCustomApplicationUniversalIdentifier,
  isActiveEngineDerived = false,
}: {
  metadataName: BackfilledOverridesMetadataName;
  flatEntity: BackfillableFlatEntity;
  workspaceCustomApplicationUniversalIdentifier: string;
  isActiveEngineDerived?: boolean;
}): AuthoredOverridesBackfillUpdate | null => {
  const hasUniversalOverrides = 'universalOverrides' in flatEntity;
  const liftedOverrides = liftLegacyAuthoredOverrides({
    metadataName,
    overrides: flatEntity.overrides,
    workspaceCustomApplicationUniversalIdentifier,
  });
  const liftedUniversalOverrides = hasUniversalOverrides
    ? liftLegacyAuthoredOverrides({
        metadataName,
        overrides: flatEntity.universalOverrides,
        workspaceCustomApplicationUniversalIdentifier,
      })
    : undefined;

  const shouldAttributeDeactivation =
    flatEntity.isActive === false &&
    !isActiveEngineDerived &&
    isCallerOverridingEntity({
      callerApplicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
      entityApplicationUniversalIdentifier:
        flatEntity.applicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
      isSystemSideEffect: flatEntity.isSystemSideEffect ?? false,
    });

  const nextOverrides = shouldAttributeDeactivation
    ? attributeDeactivationToCustomEntry({
        overrides: liftedOverrides,
        workspaceCustomApplicationUniversalIdentifier,
      })
    : liftedOverrides;
  const nextUniversalOverrides =
    shouldAttributeDeactivation && hasUniversalOverrides
      ? attributeDeactivationToCustomEntry({
          overrides: liftedUniversalOverrides,
          workspaceCustomApplicationUniversalIdentifier,
        })
      : liftedUniversalOverrides;

  const update: AuthoredOverridesBackfillUpdate = {
    ...(nextOverrides !== flatEntity.overrides
      ? { overrides: nextOverrides }
      : {}),
    ...(hasUniversalOverrides &&
    nextUniversalOverrides !== flatEntity.universalOverrides
      ? { universalOverrides: nextUniversalOverrides }
      : {}),
    ...(shouldAttributeDeactivation ? { isActive: true } : {}),
  };

  return Object.keys(update).length > 0 ? update : null;
};
