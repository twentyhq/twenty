import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';
import { TWENTY_NEXT_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-next-versions.constant';
import { TWENTY_PREVIOUS_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-previous-versions.constant';

export const TWENTY_ALL_VERSIONS = [
  ...TWENTY_PREVIOUS_VERSIONS,
  TWENTY_CURRENT_VERSION,
  ...TWENTY_NEXT_VERSIONS,
] as const;

export type TwentyAllVersion = (typeof TWENTY_ALL_VERSIONS)[number];
