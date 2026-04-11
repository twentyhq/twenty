import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';
import { TWENTY_PREVIOUS_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-previous-versions.constant';

export const CROSS_UPGRADE_SUPPORTED_VERSIONS = [
  ...TWENTY_PREVIOUS_VERSIONS,
  TWENTY_CURRENT_VERSION,
] as const;

export type CrossUpgradeSupportedVersion =
  (typeof CROSS_UPGRADE_SUPPORTED_VERSIONS)[number];
