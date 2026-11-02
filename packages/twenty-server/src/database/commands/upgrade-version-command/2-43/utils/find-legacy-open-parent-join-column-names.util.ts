import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getRelationFlatFieldMetadatasOfObject } from 'src/engine/twenty-orm/utils/get-relation-flat-field-metadatas-of-object.util';
import { isManyToOneFlatFieldMetadata } from 'src/engine/twenty-orm/utils/is-many-to-one-flat-field-metadata.util';

export const findLegacyOpenParentJoinColumnNames = ({
  flatObjectMetadata,
  readabilityParentFieldUniversalIdentifiers,
  isParentObjectOpen,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  readabilityParentFieldUniversalIdentifiers: string[];
  isParentObjectOpen: (objectMetadataId: string) => boolean;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): string[] => {
  const manyToOneFlatFieldMetadatas = getRelationFlatFieldMetadatasOfObject({
    flatObjectMetadata,
    flatFieldMetadataMaps,
  }).filter(isManyToOneFlatFieldMetadata);
  const declaredFlatFieldMetadatas = manyToOneFlatFieldMetadatas.filter(
    ({ universalIdentifier }) =>
      readabilityParentFieldUniversalIdentifiers.includes(universalIdentifier),
  );
  const declaredMorphIds = new Set(
    declaredFlatFieldMetadatas
      .filter(({ type }) => type === FieldMetadataType.MORPH_RELATION)
      .map(({ morphId }) => morphId)
      .filter(isDefined),
  );

  return manyToOneFlatFieldMetadatas
    .filter(
      (flatFieldMetadata) =>
        declaredFlatFieldMetadatas.includes(flatFieldMetadata) ||
        (flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
          isDefined(flatFieldMetadata.morphId) &&
          declaredMorphIds.has(flatFieldMetadata.morphId)),
    )
    .filter(({ relationTargetObjectMetadataId }) =>
      isParentObjectOpen(relationTargetObjectMetadataId),
    )
    .map(({ name }) => computeMorphOrRelationFieldJoinColumnName({ name }));
};
