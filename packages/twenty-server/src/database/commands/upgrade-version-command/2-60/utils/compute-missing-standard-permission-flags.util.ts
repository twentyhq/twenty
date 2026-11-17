import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';

export const computeMissingStandardPermissionFlags = ({
  standardFlatPermissionFlagMaps,
  existingFlatPermissionFlagMaps,
}: {
  standardFlatPermissionFlagMaps: Pick<
    FlatEntityMaps<FlatPermissionFlag>,
    'byUniversalIdentifier'
  >;
  existingFlatPermissionFlagMaps: Pick<
    FlatEntityMaps<FlatPermissionFlag>,
    'byUniversalIdentifier'
  >;
}): {
  permissionFlagsToCreate: FlatPermissionFlag[];
  permissionFlagsSkippedForKeyClash: FlatPermissionFlag[];
} => {
  const takenKeys = new Set(
    Object.values(existingFlatPermissionFlagMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map((existingPermissionFlag) => existingPermissionFlag.key),
  );

  const missingPermissionFlags = Object.values(
    standardFlatPermissionFlagMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (standardPermissionFlag) =>
        !isDefined(
          existingFlatPermissionFlagMaps.byUniversalIdentifier[
            standardPermissionFlag.universalIdentifier
          ],
        ),
    );

  // Keys are unique per workspace, and one rejected create would fail the whole migration
  return {
    permissionFlagsToCreate: missingPermissionFlags.filter(
      (missingPermissionFlag) => !takenKeys.has(missingPermissionFlag.key),
    ),
    permissionFlagsSkippedForKeyClash: missingPermissionFlags.filter(
      (missingPermissionFlag) => takenKeys.has(missingPermissionFlag.key),
    ),
  };
};
