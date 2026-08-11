import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  computeMorphRelationGqlFieldJoinColumnName,
  computeRelationGqlFieldJoinColumnName,
} from 'twenty-shared/utils';

export const getRelationIdFieldNames = (
  field: Pick<FieldMetadataItem, 'name' | 'type' | 'morphRelations'>,
): string[] => {
  if (field.type === FieldMetadataType.MORPH_RELATION) {
    return (field.morphRelations ?? []).map((morphRelation) =>
      computeMorphRelationGqlFieldJoinColumnName({
        fieldName: field.name,
        relationType: morphRelation.type,
        targetObjectMetadataNameSingular:
          morphRelation.targetObjectMetadata.nameSingular,
        targetObjectMetadataNamePlural:
          morphRelation.targetObjectMetadata.namePlural,
      }),
    );
  }

  return [computeRelationGqlFieldJoinColumnName({ name: field.name })];
};
