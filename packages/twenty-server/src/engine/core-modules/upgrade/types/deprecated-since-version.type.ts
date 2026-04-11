import {
  ALL_TWENTY_VERSIONS,
  type AllTwentyVersion,
} from 'src/engine/core-modules/upgrade/constants/upgrade-command-supported-versions.constant';
import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';
import { IndexOf, IsGreaterOrEqual } from 'twenty-shared/types';

export type DeprecatedSinceVersion<
  RemoveAtVersion extends AllTwentyVersion,
  T,
> =
  IsGreaterOrEqual<
    IndexOf<typeof TWENTY_CURRENT_VERSION, typeof ALL_TWENTY_VERSIONS>,
    IndexOf<RemoveAtVersion, typeof ALL_TWENTY_VERSIONS>
  > extends true
    ? never
    : T;
