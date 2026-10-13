import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

export const PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER: Record<
  string,
  PermissionFlagType
> = Object.fromEntries(
  Object.values(PermissionFlagType).map((flagType) => [
    SystemPermissionFlag[flagType],
    flagType,
  ]),
);
