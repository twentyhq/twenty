/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { DISCOVERABLE_SYSTEM_FIELD_NAMES } from 'src/engine/core-modules/record-share/constants/discoverable-system-field-names.constant';
import { isDiscoverableObject } from 'src/engine/core-modules/record-share/utils/is-discoverable-object.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Undefined when the object takes no part in existence reads.
export const resolveDiscoverableFieldMetadataIds = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): Set<string> | undefined => {
  if (!isDiscoverableObject(flatObjectMetadata)) {
    return undefined;
  }

  const declaredFieldUniversalIdentifiers = new Set(
    flatObjectMetadata.discoverableFieldUniversalIdentifiers ?? [],
  );

  const flatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );
  const isDeclared = (flatFieldMetadata: OrmFlatFieldMetadata) =>
    declaredFieldUniversalIdentifiers.has(
      flatFieldMetadata.universalIdentifier,
    );

  // Declaring one side of a morph relation covers the targets added to it
  // later, custom objects' included.
  const declaredMorphIds = new Set(
    flatFieldMetadatas
      .filter(isDeclared)
      .map((flatFieldMetadata) => flatFieldMetadata.morphId)
      .filter(isDefined),
  );

  return new Set(
    flatFieldMetadatas
      .filter(
        (flatFieldMetadata) =>
          DISCOVERABLE_SYSTEM_FIELD_NAMES.includes(flatFieldMetadata.name) ||
          isDeclared(flatFieldMetadata) ||
          (isDefined(flatFieldMetadata.morphId) &&
            declaredMorphIds.has(flatFieldMetadata.morphId)),
      )
      .map((flatFieldMetadata) => flatFieldMetadata.id),
  );
};
