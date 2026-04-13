import {
  TWENTY_ALL_VERSIONS,
  TwentyAllVersion,
} from 'src/engine/core-modules/upgrade/constants/twenty-all-versions.constant';
import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';
import { IndexOf, IsGreaterOrEqual } from 'twenty-shared/types';

export type RemovedSinceVersion<RemoveAtVersion extends TwentyAllVersion, T> =
  IsGreaterOrEqual<
    IndexOf<typeof TWENTY_CURRENT_VERSION, typeof TWENTY_ALL_VERSIONS>,
    IndexOf<RemoveAtVersion, typeof TWENTY_ALL_VERSIONS>
  > extends true
    ? never
    : T;
