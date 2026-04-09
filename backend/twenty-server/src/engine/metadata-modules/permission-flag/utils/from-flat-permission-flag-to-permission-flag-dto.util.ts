import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { type PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';

export const fromFlatPermissionFlagToPermissionFlagDto = (
  flatPermissionFlag: FlatPermissionFlag,
): PermissionFlagDTO => ({
  id: flatPermissionFlag.id,
  roleId: flatPermissionFlag.roleId,
  flag: flatPermissionFlag.flag,
});
