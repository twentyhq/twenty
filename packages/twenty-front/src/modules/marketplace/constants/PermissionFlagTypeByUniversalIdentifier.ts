import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

export const PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER = new Map<
  string,
  PermissionFlagType
>(
  Object.values(PermissionFlagType).map((flagType) => [
    SystemPermissionFlag[flagType],
    flagType,
  ]),
);
