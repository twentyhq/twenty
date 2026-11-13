import {
  getFieldPermissionUniversalIdentifier,
  getObjectPermissionUniversalIdentifier,
  type RoleManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

const omitDerivedUniversalIdentifiers = <
  TPermission extends { universalIdentifier?: string },
>({
  permissions,
  getDerivedUniversalIdentifier,
}: {
  permissions: TPermission[];
  getDerivedUniversalIdentifier: (
    permission: Omit<TPermission, 'universalIdentifier'>,
  ) => string;
}) =>
  permissions.map(({ universalIdentifier, ...permission }) =>
    universalIdentifier === getDerivedUniversalIdentifier(permission)
      ? permission
      : { universalIdentifier, ...permission },
  );

export const fromRoleManifestToRoleConfig = ({
  roleManifest,
  applicationUniversalIdentifier,
}: {
  roleManifest: RoleManifest;
  applicationUniversalIdentifier: string;
}): RoleManifest => {
  const {
    universalIdentifier: roleUniversalIdentifier,
    objectPermissions,
    fieldPermissions,
  } = roleManifest;

  return {
    ...roleManifest,
    ...(isDefined(objectPermissions)
      ? {
          objectPermissions: omitDerivedUniversalIdentifiers({
            permissions: objectPermissions,
            getDerivedUniversalIdentifier: ({ objectUniversalIdentifier }) =>
              getObjectPermissionUniversalIdentifier({
                applicationUniversalIdentifier,
                roleUniversalIdentifier,
                objectUniversalIdentifier,
              }),
          }),
        }
      : {}),
    ...(isDefined(fieldPermissions)
      ? {
          fieldPermissions: omitDerivedUniversalIdentifiers({
            permissions: fieldPermissions,
            getDerivedUniversalIdentifier: ({ fieldUniversalIdentifier }) =>
              getFieldPermissionUniversalIdentifier({
                applicationUniversalIdentifier,
                roleUniversalIdentifier,
                fieldUniversalIdentifier,
              }),
          }),
        }
      : {}),
  };
};
