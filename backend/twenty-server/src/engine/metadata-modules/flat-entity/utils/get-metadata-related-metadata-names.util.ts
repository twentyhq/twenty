import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataManyToOneRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-related-metadata-names.type';
import { type MetadataOneToManyRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-one-to-many-related-metadata-names.type';
import { getMetadataManyToOneRelatedNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-many-to-one-related-names.util';
import { getMetadataOneToManyRelatedNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-one-to-many-related-names.util';

export const getMetadataRelatedMetadataNames = <T extends AllMetadataName>(
  metadataName: T,
) => {
  const manyToOneMetadataNames = getMetadataManyToOneRelatedNames(metadataName);
  const oneToManyMetadataNames = getMetadataOneToManyRelatedNames(metadataName);

  return [
    ...new Set([...manyToOneMetadataNames, ...oneToManyMetadataNames]),
  ] as (
    | MetadataOneToManyRelatedMetadataNames<T>
    | MetadataManyToOneRelatedMetadataNames<T>
  )[];
};
