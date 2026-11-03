import {
  type EffectiveObjectPermissions,
  getEffectiveObjectPermissionsFromRoleManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type ExplicitObjectGrants } from 'src/engine/core-modules/tool-provider/interfaces/explicit-object-grants.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildExplicitObjectPermissionByObjectId = ({
  explicitObjectGrants,
  flatObjectMetadataMaps,
}: {
  explicitObjectGrants: ExplicitObjectGrants;
  flatObjectMetadataMaps: Pick<
    FlatEntityMaps<FlatObjectMetadata>,
    'byUniversalIdentifier'
  >;
}): Map<string, EffectiveObjectPermissions> =>
  new Map(
    Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .flatMap((flatObjectMetadata) => {
        const effectiveObjectPermissions =
          getEffectiveObjectPermissionsFromRoleManifest({
            role: explicitObjectGrants,
            objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
          });

        return Object.values(effectiveObjectPermissions).some(
          (isGranted) => isGranted,
        )
          ? [[flatObjectMetadata.id, effectiveObjectPermissions] as const]
          : [];
      }),
  );
