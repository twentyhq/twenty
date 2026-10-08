import {
  type IndexManifest,
  getIndexFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export const fromFlatIndexMetadataToIndexManifest = ({
  flatIndexMetadata,
}: {
  flatIndexMetadata: UniversalFlatIndexMetadata;
}): IndexManifest => ({
  universalIdentifier: flatIndexMetadata.universalIdentifier,
  objectUniversalIdentifier:
    flatIndexMetadata.objectMetadataUniversalIdentifier,
  indexType: flatIndexMetadata.indexType,
  isUnique: flatIndexMetadata.isUnique,
  fields: [...flatIndexMetadata.universalFlatIndexFieldMetadatas]
    .sort((left, right) => left.order - right.order)
    .map((indexField) => ({
      universalIdentifier: getIndexFieldUniversalIdentifier({
        applicationUniversalIdentifier:
          flatIndexMetadata.applicationUniversalIdentifier,
        indexUniversalIdentifier: flatIndexMetadata.universalIdentifier,
        fieldUniversalIdentifier: indexField.fieldMetadataUniversalIdentifier,
        subFieldName: indexField.subFieldName,
      }),
      fieldUniversalIdentifier: indexField.fieldMetadataUniversalIdentifier,
      ...(isDefined(indexField.subFieldName)
        ? { subFieldName: indexField.subFieldName }
        : {}),
    })),
});
