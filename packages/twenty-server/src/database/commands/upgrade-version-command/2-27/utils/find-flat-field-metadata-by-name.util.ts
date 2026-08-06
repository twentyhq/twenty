import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type FindFlatFieldMetadataByNameArgs = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  objectNameSingular: string;
  fieldName: string;
};

// Custom objects have no STANDARD_OBJECTS constant to resolve a universal
// identifier from, so they can only be located by name
export const findFlatFieldMetadataByName = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectNameSingular,
  fieldName,
}: FindFlatFieldMetadataByNameArgs): FlatFieldMetadata | undefined => {
  const flatObjectMetadata = Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).find((candidate) => candidate?.nameSingular === objectNameSingular);

  if (!isDefined(flatObjectMetadata)) {
    return undefined;
  }

  return Object.values(flatFieldMetadataMaps.byUniversalIdentifier).find(
    (candidate) =>
      candidate?.objectMetadataId === flatObjectMetadata.id &&
      candidate.name === fieldName,
  );
};
