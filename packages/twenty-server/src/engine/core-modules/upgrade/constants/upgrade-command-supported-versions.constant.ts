export const TWENTY_PREVIOUS_VERSIONS = ['1.20.0', '1.21.0'] as const;
export const TWENTY_CURRENT_VERSION = '1.22.0' as const;
export const TWENTY_NEXT_VERSIONS = ['1.23.0'] as const;

export const UPGRADE_CROSS_VERSION_SUPPORTED_TWENTY_VERSIONS = [
  ...TWENTY_PREVIOUS_VERSIONS,
  TWENTY_CURRENT_VERSION,
] as const;
export type UpgradeCommandVersion =
  (typeof UPGRADE_CROSS_VERSION_SUPPORTED_TWENTY_VERSIONS)[number];

export const ALL_TWENTY_VERSIONS = [
  ...TWENTY_PREVIOUS_VERSIONS,
  TWENTY_CURRENT_VERSION,
  ...TWENTY_NEXT_VERSIONS,
] as const;

export type TwentyAllVersions = (typeof ALL_TWENTY_VERSIONS)[number];
