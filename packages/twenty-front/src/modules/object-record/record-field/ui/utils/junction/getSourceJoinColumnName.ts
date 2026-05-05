import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  computeMorphRelationFieldJoinColumnName,
  computeRelationFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';

type GetSourceJoinColumnNameArgs = {
  sourceField: Pick<FieldMetadataItem, 'name' | 'type' | 'morphRelations'>;
  sourceObjectMetadata: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'nameSingular' | 'namePlural'
  >;
};

export const getSourceJoinColumnName = ({
  sourceField,
  sourceObjectMetadata,
}: GetSourceJoinColumnNameArgs): string | undefined => {
  if (sourceField.type === FieldMetadataType.MORPH_RELATION) {
    const morphRelation = sourceField.morphRelations?.find(
      (mr) => mr.targetObjectMetadata.id === sourceObjectMetadata.id,
    );

    if (!isDefined(morphRelation)) {
      return undefined;
    }

    return computeMorphRelationFieldJoinColumnName({
      fieldName: morphRelation.sourceFieldMetadata.name,
      relationType: morphRelation.type,
      targetObjectMetadataNameSingular: sourceObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural: sourceObjectMetadata.namePlural,
    });
  }

  return computeRelationFieldJoinColumnName({ name: sourceField.name });
};
