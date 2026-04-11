import {
  ALL_TWENTY_VERSIONS,
  AllTwentyVersion,
} from 'src/engine/core-modules/upgrade/constants/twenty-all-versions.constant';
import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';
import { IndexOf, IsGreaterOrEqual } from 'twenty-shared/types';

export type RemovedSinceVersion<
  RemoveAtVersion extends AllTwentyVersion,
  T,
> =
  IsGreaterOrEqual<
    IndexOf<typeof TWENTY_CURRENT_VERSION, typeof ALL_TWENTY_VERSIONS>,
    IndexOf<RemoveAtVersion, typeof ALL_TWENTY_VERSIONS>
  > extends true
    ? never
    : T;
