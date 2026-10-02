import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildPositionIdIndexForObject } from 'src/engine/metadata-modules/object-metadata/utils/build-position-id-index-for-object.util';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export type PositionIdIndex = {
  flatObjectMetadata: FlatObjectMetadata;
  universalFlatIndexMetadata: UniversalFlatIndexMetadata;
};

export const buildPositionIdIndexes = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  now,
}: Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
> & {
  now: string;
}): PositionIdIndex[] =>
  Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .flatMap((flatObjectMetadata) => {
      const universalFlatIndexMetadata = buildPositionIdIndexForObject({
        flatObjectMetadata,
        objectFlatFieldMetadatas: getFlatFieldsFromFlatObjectMetadata(
          flatObjectMetadata,
          flatFieldMetadataMaps,
        ),
        now,
      });

      return isDefined(universalFlatIndexMetadata)
        ? [{ flatObjectMetadata, universalFlatIndexMetadata }]
        : [];
    });
