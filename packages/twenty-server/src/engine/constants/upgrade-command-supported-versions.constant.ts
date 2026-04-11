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
// The last entry is used as the default target for generate:instance-command.
export const UPGRADE_COMMAND_NEXT_VERSIONS = ['1.23.0'] as const;

export type UpgradeCommandVersion =
  | (typeof UPGRADE_COMMAND_SUPPORTED_VERSIONS)[number]
  | (typeof UPGRADE_COMMAND_NEXT_VERSIONS)[number];

export const CURRENT_VERSION =
  UPGRADE_COMMAND_SUPPORTED_VERSIONS[
    UPGRADE_COMMAND_SUPPORTED_VERSIONS.length - 1
  ];
