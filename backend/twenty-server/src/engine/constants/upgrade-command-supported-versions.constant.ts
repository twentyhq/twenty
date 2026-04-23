export const UPGRADE_COMMAND_SUPPORTED_VERSIONS = [
  '1.19.0',
  '1.20.0',
  '1.21.0',
] as const;

export type UpgradeCommandVersion =
  (typeof UPGRADE_COMMAND_SUPPORTED_VERSIONS)[number];
