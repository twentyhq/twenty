import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildObjectIdByNameMaps = (
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
): {
  idByNameSingular: Record<string, string>;
  idByNamePlural: Record<string, string>;
} => {
  const idByNameSingular: Record<string, string> = {};
  const idByNamePlural: Record<string, string> = {};

  for (const objectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(objectMetadata)) {
      continue;
    }

    idByNameSingular[objectMetadata.nameSingular] = objectMetadata.id;
    idByNamePlural[objectMetadata.namePlural] = objectMetadata.id;
  }

  return { idByNameSingular, idByNamePlural };
};
