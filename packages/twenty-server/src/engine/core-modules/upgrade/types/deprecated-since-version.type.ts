import {
  TWENTY_CURRENT_VERSION,
  TwentyAllVersions,
} from 'src/engine/core-modules/upgrade/constants/upgrade-command-supported-versions.constant';
import { IndexOf, IsGreaterOrEqual } from 'twenty-shared/types';

export type DeprecatedSinceVersion<
  RemoveAtVersion extends TwentyAllVersions,
  T,
> =
  IsGreaterOrEqual<
    IndexOf<typeof TWENTY_CURRENT_VERSION, TwentyAllVersions>,
    IndexOf<RemoveAtVersion, TwentyAllVersions>
  > extends true
    ? never
    : T;
