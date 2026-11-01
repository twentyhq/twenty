import {
  getOwnObjectPermissions,
  type RoleManifest,
} from 'twenty-shared/application';

// The request as the server stores it at install: own objects are requested with every action
export const getInstallRequestedRoleManifest = ({
  defaultRole,
  ownObjectUniversalIdentifiers,
}: {
  defaultRole: RoleManifest;
  ownObjectUniversalIdentifiers: string[];
}): RoleManifest => ({
  ...defaultRole,
  objectPermissions: [
    ...(defaultRole.objectPermissions ?? []),
    ...getOwnObjectPermissions({
      roleManifest: defaultRole,
      ownObjectUniversalIdentifiers,
    }),
  ],
});
