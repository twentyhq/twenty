import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeMorphRelationGqlFieldName } from 'twenty-shared/utils';
export const computePossibleMorphGqlFieldForFieldName = ({
  fieldMetadata,
}: {
  fieldMetadata: Pick<
    FieldMorphRelationMetadata,
    'morphRelations' | 'fieldName'
  >;
}) =>
  fieldMetadata.morphRelations.map((morphRelation) => {
    return computeMorphRelationGqlFieldName({
      fieldName: fieldMetadata.fieldName,
      relationType: morphRelation.type,
      targetObjectMetadataNameSingular:
        morphRelation.targetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural:
        morphRelation.targetObjectMetadata.namePlural,
    });
  });
