// Keep at least two entries: the current version and the one before it.
// getPreviousVersion() looks up the entry just below the current version
// to determine the minimum workspace version eligible for upgrade.
// Removing the previous version would cause the upgrade command to fail.
export const UPGRADE_COMMAND_SUPPORTED_VERSIONS = ['1.20.0', '1.21.0'] as const;

export type UpgradeCommandVersion =
  (typeof UPGRADE_COMMAND_SUPPORTED_VERSIONS)[number];
