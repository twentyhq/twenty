import { type PermissionFlagManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';

export const fromFlatPermissionFlagToPermissionFlagManifest = ({
  flatPermissionFlag,
}: {
  flatPermissionFlag: FlatPermissionFlag;
}): PermissionFlagManifest => {
  return {
    universalIdentifier: flatPermissionFlag.universalIdentifier,
    key: flatPermissionFlag.key,
    label: flatPermissionFlag.label,
    ...(isDefined(flatPermissionFlag.description)
      ? { description: flatPermissionFlag.description }
      : {}),
    ...(isDefined(flatPermissionFlag.icon)
      ? { icon: flatPermissionFlag.icon }
      : {}),
  };
};
