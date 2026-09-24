import {
  getRoleManifestGrantsNotCoveredBy,
  type Manifest,
  type RoleManifest,
  type RoleManifestGrant,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const getDefaultRoleGrantsAddedByManifest = ({
  installedDefaultRole,
  manifest,
}: {
  installedDefaultRole: RoleManifest;
  manifest: Pick<Manifest, 'application' | 'roles' | 'permissionFlags'>;
}): RoleManifestGrant[] => {
  const targetDefaultRole = manifest.roles.find(
    ({ universalIdentifier }) =>
      universalIdentifier ===
      manifest.application.defaultRoleUniversalIdentifier,
  );

  if (!isDefined(targetDefaultRole)) {
    return [];
  }

  return getRoleManifestGrantsNotCoveredBy({
    role: targetDefaultRole,
    superset: installedDefaultRole,
    toolPermissionFlagUniversalIdentifiers: manifest.permissionFlags
      .filter((flag) => (flag.permissionType ?? 'tool') === 'tool')
      .map(({ universalIdentifier }) => universalIdentifier),
  });
};
