import { isDefined } from 'twenty-shared/utils';

import {
  type BackfilledOverridesMetadataName,
  LEGACY_OVERRIDE_ENTRY_PROPERTY_NAMES_BY_METADATA_NAME,
} from 'src/database/commands/upgrade-version-command/2-40/constants/legacy-override-entry-property-names-by-metadata-name.constant';

export type AuthoredOverridesRecord = Record<string, unknown>;

export const isAuthoredOverridesRecord = (
  value: unknown,
): value is AuthoredOverridesRecord =>
  isDefined(value) && typeof value === 'object' && !Array.isArray(value);

// A flat blob was written by the workspace custom application, the only
// author before overrides became author-keyed, so it lifts under that key.
// Returns the input as is when it is already author-keyed, absent or empty.
export const liftLegacyAuthoredOverrides = ({
  metadataName,
  overrides,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  metadataName: BackfilledOverridesMetadataName;
  overrides: unknown;
  workspaceCustomApplicationUniversalIdentifier: string;
}): unknown => {
  if (!isAuthoredOverridesRecord(overrides)) {
    return overrides;
  }

  const legacyPropertyNames: readonly string[] =
    LEGACY_OVERRIDE_ENTRY_PROPERTY_NAMES_BY_METADATA_NAME[metadataName];
  const isLegacy = Object.keys(overrides).some((key) =>
    legacyPropertyNames.includes(key),
  );

  return isLegacy
    ? { [workspaceCustomApplicationUniversalIdentifier]: overrides }
    : overrides;
};
