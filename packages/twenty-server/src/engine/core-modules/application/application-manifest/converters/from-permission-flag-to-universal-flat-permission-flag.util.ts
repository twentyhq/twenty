import { type PermissionFlagType } from 'twenty-shared/constants';
import { v5 as uuidv5 } from 'uuid';

import { type UniversalFlatPermissionFlag } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-permission-flag.type';

// Stable namespace used to derive a deterministic universalIdentifier from
// the (role, flag) natural key of a PermissionFlagEntity.
const PERMISSION_FLAG_UNIVERSAL_IDENTIFIER_NAMESPACE =
  'df8dfb15-949a-4176-ad79-85c0c7bc9a66';

export const fromPermissionFlagToUniversalFlatPermissionFlag = ({
  permissionFlag,
  roleUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  permissionFlag: PermissionFlagType;
  roleUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatPermissionFlag => {
  return {
    universalIdentifier: uuidv5(
      `${roleUniversalIdentifier}:${permissionFlag}`,
      PERMISSION_FLAG_UNIVERSAL_IDENTIFIER_NAMESPACE,
    ),
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    flag: permissionFlag,
    createdAt: now,
    updatedAt: now,
  };
};
