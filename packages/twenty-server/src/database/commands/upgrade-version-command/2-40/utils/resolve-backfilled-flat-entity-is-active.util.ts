import { type BackfilledOverridesMetadataName } from 'src/database/commands/upgrade-version-command/2-40/constants/legacy-override-entry-property-names-by-metadata-name.constant';
import {
  isAuthoredOverridesRecord,
  liftLegacyAuthoredOverrides,
} from 'src/database/commands/upgrade-version-command/2-40/utils/lift-legacy-authored-overrides.util';

// The effective value the row resolves to whether or not it has been
// backfilled yet: the custom entry, then the owner entry, then the column.
export const resolveBackfilledFlatEntityIsActive = ({
  metadataName,
  flatEntity,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  metadataName: BackfilledOverridesMetadataName;
  flatEntity: {
    applicationUniversalIdentifier: string;
    isActive: boolean;
    overrides?: unknown;
  };
  workspaceCustomApplicationUniversalIdentifier: string;
}): boolean => {
  const authoredOverrides = liftLegacyAuthoredOverrides({
    metadataName,
    overrides: flatEntity.overrides,
    workspaceCustomApplicationUniversalIdentifier,
  });

  if (!isAuthoredOverridesRecord(authoredOverrides)) {
    return flatEntity.isActive;
  }

  for (const author of [
    workspaceCustomApplicationUniversalIdentifier,
    flatEntity.applicationUniversalIdentifier,
  ]) {
    const entry = authoredOverrides[author];

    if (isAuthoredOverridesRecord(entry) && typeof entry.isActive === 'boolean') {
      return entry.isActive;
    }
  }

  return flatEntity.isActive;
};
