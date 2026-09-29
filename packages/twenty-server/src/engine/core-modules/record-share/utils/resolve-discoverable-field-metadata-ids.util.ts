/* @license Enterprise */

import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { DISCOVERABLE_SYSTEM_FIELD_NAMES } from 'src/engine/core-modules/record-share/constants/discoverable-system-field-names.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const isDiscoverableObject = (
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'readability' | 'discoverableFieldUniversalIdentifiers'
  >,
): boolean =>
  flatObjectMetadata.readability === MetadataReadability.DISCOVERABLE ||
  isDefined(flatObjectMetadata.discoverableFieldUniversalIdentifiers);

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

  return new Set(
    getFlatFieldsFromFlatObjectMetadata(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    )
      .filter(
        (flatFieldMetadata) =>
          DISCOVERABLE_SYSTEM_FIELD_NAMES.includes(flatFieldMetadata.name) ||
          declaredFieldUniversalIdentifiers.has(
            flatFieldMetadata.universalIdentifier,
          ),
      )
      .map((flatFieldMetadata) => flatFieldMetadata.id),
  );
};
