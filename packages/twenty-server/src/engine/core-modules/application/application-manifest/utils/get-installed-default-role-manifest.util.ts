import { type RoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getApplicationSubAllFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/get-application-sub-all-flat-entity-maps.util';
import { reconstructRolesManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-roles-manifest.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const getInstalledDefaultRoleManifest = ({
  applicationId,
  flatApplicationMaps,
  allFlatEntityMaps,
}: {
  applicationId: string;
  flatApplicationMaps: {
    byId: Partial<Record<string, Pick<FlatApplication, 'defaultRoleId'>>>;
  };
  allFlatEntityMaps: AllFlatEntityMaps;
}): RoleManifest | undefined => {
  const defaultRoleId = flatApplicationMaps.byId[applicationId]?.defaultRoleId;

  if (!isDefined(defaultRoleId)) {
    return undefined;
  }

  const defaultRoleUniversalIdentifier =
    allFlatEntityMaps.flatRoleMaps.universalIdentifierById[defaultRoleId];

  if (!isDefined(defaultRoleUniversalIdentifier)) {
    return undefined;
  }

  const applicationAllFlatEntityMaps = getApplicationSubAllFlatEntityMaps({
    applicationIds: [applicationId],
    fromAllFlatEntityMaps: allFlatEntityMaps,
  });
  const allApplicationObjectUniversalIdentifiers = new Set(
    Object.keys(
      applicationAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    ),
  );
  const allApplicationFieldUniversalIdentifiers = new Set(
    Object.keys(
      applicationAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    ),
  );

  const { roles } = reconstructRolesManifest({
    applicationAllFlatEntityMaps,
    allFlatEntityMaps,
    exportedObjectUniversalIdentifiers:
      allApplicationObjectUniversalIdentifiers,
    resolvableFieldUniversalIdentifiers:
      allApplicationFieldUniversalIdentifiers,
  });

  return roles.find(
    ({ universalIdentifier }) =>
      universalIdentifier === defaultRoleUniversalIdentifier,
  );
};
