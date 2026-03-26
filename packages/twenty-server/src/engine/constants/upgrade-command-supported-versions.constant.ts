export const UPGRADE_COMMAND_SUPPORTED_VERSIONS = [
  '1.16.0',
  '1.17.0',
  '1.18.0',
  '1.19.0',
  '1.20.0',
] as const;

export type UpgradeCommandVersion =
  (typeof UPGRADE_COMMAND_SUPPORTED_VERSIONS)[number];
