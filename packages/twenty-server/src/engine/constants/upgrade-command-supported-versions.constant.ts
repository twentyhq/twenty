import { type IndexOf, type IsGreaterOrEqual } from 'twenty-shared/types';

// Keep at least two entries: the current version and the one before it.
// getPreviousVersion() looks up the entry just below the current version
// to determine the minimum workspace version eligible for upgrade.
// Removing the previous version would cause the upgrade command to fail.
export const UPGRADE_COMMAND_SUPPORTED_VERSIONS = [
  '1.20.0',
  '1.21.0',
  '1.22.0',
] as const;

// Unreleased versions. Commands can be declared for them today but
// won't run until promoted into UPGRADE_COMMAND_SUPPORTED_VERSIONS.
export const UPGRADE_COMMAND_NEXT_VERSIONS = ['1.23.0'] as const;

export const ALL_UPGRADE_COMMAND_VERSIONS = [
  ...UPGRADE_COMMAND_SUPPORTED_VERSIONS,
  ...UPGRADE_COMMAND_NEXT_VERSIONS,
] as const;

export type UpgradeCommandVersion =
  (typeof ALL_UPGRADE_COMMAND_VERSIONS)[number];

export const CURRENT_VERSION =
  UPGRADE_COMMAND_SUPPORTED_VERSIONS[
    UPGRADE_COMMAND_SUPPORTED_VERSIONS.length - 1
  ];

// Resolves to T when CURRENT_VERSION < RemoveAtVersion, never otherwise.
// Use on fields that should cause compile errors once the version is reached.
//
// Usage: version: DeprecatedSince<'1.23.0', string | null>;
type AllVersions = typeof ALL_UPGRADE_COMMAND_VERSIONS;

export type DeprecatedSince<
  RemoveAtVersion extends UpgradeCommandVersion,
  T,
> = IsGreaterOrEqual<
  IndexOf<typeof CURRENT_VERSION, AllVersions>,
  IndexOf<RemoveAtVersion, AllVersions>
> extends true
  ? never
  : T;
