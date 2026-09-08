import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { MANIFEST_ENTITY_REGISTRY } from 'src/engine/core-modules/application/application-manifest/utils/find-manifest-entity-descriptor-by-universal-identifier.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const getUnresolvableObjectReason = ({
  metadataName,
  objectUniversalIdentifier,
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
}: {
  metadataName: AllMetadataName;
  objectUniversalIdentifier: string | null;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
}): string | undefined => {
  if (!isDefined(objectUniversalIdentifier)) {
    return undefined;
  }

  const label = MANIFEST_ENTITY_REGISTRY[metadataName].entityKind;

  if (
    isDefined(
      applicationAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        objectUniversalIdentifier
      ],
    ) &&
    !exportedObjectUniversalIdentifiers.has(objectUniversalIdentifier)
  ) {
    return `${label} on an unsupported object`;
  }

  if (
    !isDefined(
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        objectUniversalIdentifier
      ],
    )
  ) {
    return `${label} on an object that does not exist`;
  }

  return undefined;
};
