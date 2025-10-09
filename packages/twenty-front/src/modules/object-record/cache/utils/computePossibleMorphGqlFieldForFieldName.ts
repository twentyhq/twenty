import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { computeMorphRelationFieldName } from 'twenty-shared/utils';

export const computePossibleMorphGqlFieldForFieldName = ({
  morphRelations,
  fieldName,
}: {
  morphRelations: FieldMetadataItemRelation[];
  fieldName: string;
}) =>
  morphRelations.map((morphRelation) => {
    return computeMorphRelationFieldName({
      fieldName,
      relationType: morphRelation.type,
      targetObjectMetadataNameSingular:
        morphRelation.targetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural:
        morphRelation.targetObjectMetadata.namePlural,
    });
  });
