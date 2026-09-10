import { isDefined } from 'twenty-shared/utils';

import { MANIFEST_ENTITY_REGISTRY } from 'src/engine/core-modules/application/application-manifest/utils/find-manifest-entity-descriptor-by-universal-identifier.util';
import { type ChildMetadataName } from 'src/engine/core-modules/application/application-manifest/types/export-classification.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const getUnresolvableFieldReason = ({
  metadataName,
  fieldMetadataUniversalIdentifier,
  allFlatEntityMaps,
}: {
  metadataName: ChildMetadataName;
  fieldMetadataUniversalIdentifier: string;
  allFlatEntityMaps: AllFlatEntityMaps;
}): string | undefined =>
  isDefined(
    allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
      fieldMetadataUniversalIdentifier
    ],
  )
    ? undefined
    : `${MANIFEST_ENTITY_REGISTRY[metadataName].entityKind} on a field that does not exist`;
