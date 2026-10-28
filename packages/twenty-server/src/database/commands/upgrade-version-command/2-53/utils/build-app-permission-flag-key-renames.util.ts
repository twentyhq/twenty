import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getAppPermissionFlagKeyMappings } from 'src/database/commands/upgrade-version-command/2-53/utils/get-app-permission-flag-key-mappings.util';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';

type PermissionFlagKeyRename = {
  permissionFlagId: string;
  universalIdentifier: string;
  fromKey: string;
  toKey: string;
};

type PermissionFlagKeyCollision = PermissionFlagKeyRename & {
  conflictingPermissionFlag: FlatPermissionFlag;
};

export const buildAppPermissionFlagKeyRenames = ({
  flatPermissionFlagsByUniversalIdentifier,
  direction,
}: {
  flatPermissionFlagsByUniversalIdentifier: Record<
    string,
    FlatPermissionFlag | undefined
  >;
  direction: 'up' | 'down';
}): {
  permissionFlagKeyRenames: PermissionFlagKeyRename[];
  permissionFlagKeyCollisions: PermissionFlagKeyCollision[];
} => {
  const flatPermissionFlags = Object.values(
    flatPermissionFlagsByUniversalIdentifier,
  ).filter(isDefined);

  const permissionFlagKeyRenames: PermissionFlagKeyRename[] = [];
  const permissionFlagKeyCollisions: PermissionFlagKeyCollision[] = [];

  for (const {
    universalIdentifier,
    fromKey,
    toKey,
  } of getAppPermissionFlagKeyMappings(direction)) {
    const permissionFlag =
      flatPermissionFlagsByUniversalIdentifier[universalIdentifier];

    if (
      !isDefined(permissionFlag) ||
      permissionFlag.applicationUniversalIdentifier !==
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
      permissionFlag.key !== fromKey
    ) {
      continue;
    }

    const permissionFlagKeyRename = {
      permissionFlagId: permissionFlag.id,
      universalIdentifier,
      fromKey,
      toKey,
    };

    const conflictingPermissionFlag = flatPermissionFlags.find(
      ({ key }) => key === toKey,
    );

    if (isDefined(conflictingPermissionFlag)) {
      permissionFlagKeyCollisions.push({
        ...permissionFlagKeyRename,
        conflictingPermissionFlag,
      });

      continue;
    }

    permissionFlagKeyRenames.push(permissionFlagKeyRename);
  }

  return { permissionFlagKeyRenames, permissionFlagKeyCollisions };
};
