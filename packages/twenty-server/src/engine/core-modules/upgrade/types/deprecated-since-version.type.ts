import {
  ALL_TWENTY_VERSIONS,
  TWENTY_CURRENT_VERSION,
  TwentyAllVersions,
} from 'src/engine/core-modules/upgrade/constants/upgrade-command-supported-versions.constant';
import { IndexOf, IsGreaterOrEqual } from 'twenty-shared/types';

export type DeprecatedSinceVersion<
  RemoveAtVersion extends TwentyAllVersions,
  T,
> =
  IsGreaterOrEqual<
    IndexOf<typeof TWENTY_CURRENT_VERSION, typeof ALL_TWENTY_VERSIONS>,
    IndexOf<RemoveAtVersion, typeof ALL_TWENTY_VERSIONS>
  > extends true
    ? never
    : T;
