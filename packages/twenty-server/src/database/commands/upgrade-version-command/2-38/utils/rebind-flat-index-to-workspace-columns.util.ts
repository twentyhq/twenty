import { isDefined } from 'twenty-shared/utils';

import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeFlatIndexNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/compute-flat-index-name.util';

export const rebindFlatIndexToWorkspaceColumns = ({
  flatIndexMetadata,
  flatObjectMetadata,
  objectFlatFieldMetadatas,
  columnNames,
}: {
  flatIndexMetadata: FlatIndexMetadata;
  flatObjectMetadata: FlatObjectMetadata;
  objectFlatFieldMetadatas: FlatFieldMetadata[];
  columnNames: string[];
}): FlatIndexMetadata => {
  const flatFieldMetadatas = columnNames.map((columnName) => {
    const flatFieldMetadata = objectFlatFieldMetadatas.find(
      (candidateFlatFieldMetadata) =>
        isMorphOrRelationFlatFieldMetadata(candidateFlatFieldMetadata) &&
        getJoinColumnNameForRelationField(candidateFlatFieldMetadata) ===
          columnName,
    );

    if (!isDefined(flatFieldMetadata)) {
      throw new Error(
        `Could not find relation field for column ${columnName} on object ${flatObjectMetadata.nameSingular}`,
      );
    }

    return flatFieldMetadata;
  });

  const flatIndexFieldMetadatas = flatFieldMetadatas.map(
    (flatFieldMetadata, order) => {
      const templateFlatIndexFieldMetadata =
        flatIndexMetadata.flatIndexFieldMetadatas.find(
          (flatIndexFieldMetadata) => flatIndexFieldMetadata.order === order,
        );

      if (!isDefined(templateFlatIndexFieldMetadata)) {
        throw new Error(
          `Could not find index field at order ${order} for index ${flatIndexMetadata.universalIdentifier}`,
        );
      }

      return {
        ...templateFlatIndexFieldMetadata,
        fieldMetadataId: flatFieldMetadata.id,
      };
    },
  );
  const universalFlatIndexFieldMetadatas = flatFieldMetadatas.map(
    (flatFieldMetadata, order) => {
      const templateUniversalFlatIndexFieldMetadata =
        flatIndexMetadata.universalFlatIndexFieldMetadatas.find(
          (flatIndexFieldMetadata) => flatIndexFieldMetadata.order === order,
        );

      if (!isDefined(templateUniversalFlatIndexFieldMetadata)) {
        throw new Error(
          `Could not find universal index field at order ${order} for index ${flatIndexMetadata.universalIdentifier}`,
        );
      }

      return {
        ...templateUniversalFlatIndexFieldMetadata,
        fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
      };
    },
  );

  return {
    ...flatIndexMetadata,
    name: computeFlatIndexNameOrThrow({
      flatObjectMetadata,
      objectFlatFieldMetadatas,
      indexFields: universalFlatIndexFieldMetadatas,
      isUnique: flatIndexMetadata.isUnique,
      indexWhereClause: flatIndexMetadata.indexWhereClause,
    }),
    objectMetadataId: flatObjectMetadata.id,
    flatIndexFieldMetadatas,
    universalFlatIndexFieldMetadatas,
  };
};
