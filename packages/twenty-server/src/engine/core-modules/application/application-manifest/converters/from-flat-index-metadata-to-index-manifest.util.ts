import { type IndexManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v5 as uuidv5 } from 'uuid';

import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export const computeIndexFieldManifestUniversalIdentifier = ({
  indexUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
  subFieldName,
}: {
  indexUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
  subFieldName: string | null | undefined;
}): string =>
  uuidv5(
    `${fieldMetadataUniversalIdentifier}:${subFieldName ?? ''}`,
    indexUniversalIdentifier,
  );

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
      universalIdentifier: computeIndexFieldManifestUniversalIdentifier({
        indexUniversalIdentifier: flatIndexMetadata.universalIdentifier,
        fieldMetadataUniversalIdentifier:
          indexField.fieldMetadataUniversalIdentifier,
        subFieldName: indexField.subFieldName,
      }),
      fieldUniversalIdentifier: indexField.fieldMetadataUniversalIdentifier,
      ...(isDefined(indexField.subFieldName)
        ? { subFieldName: indexField.subFieldName }
        : {}),
    })),
});
