import { compositeTypeDefinitions, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const getWorkspaceApiFieldNames = ({
  flatFieldMetadata,
  name,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  name: string;
}): string[] => {
  const isToOneRelation =
    isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
    flatFieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE;

  if (isToOneRelation) {
    return [name, computeMorphOrRelationFieldJoinColumnName({ name })];
  }

  if (!isCompositeFieldMetadataType(flatFieldMetadata.type)) {
    return [name];
  }

  const compositeType = compositeTypeDefinitions.get(flatFieldMetadata.type);

  if (!isDefined(compositeType)) {
    return [name];
  }

  return [
    name,
    ...compositeType.properties.map((property) =>
      computeCompositeColumnName(name, property),
    ),
  ];
};
