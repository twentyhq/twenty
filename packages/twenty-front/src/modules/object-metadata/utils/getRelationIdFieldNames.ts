import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { computeMorphRelationGqlFieldJoinColumnName } from 'twenty-shared/utils';

// A morph relation has one foreign-key column per target object
// (e.g. targetCompanyId, targetPersonId), not a single `${name}Id` column.
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

  return [`${field.name}Id`];
};
