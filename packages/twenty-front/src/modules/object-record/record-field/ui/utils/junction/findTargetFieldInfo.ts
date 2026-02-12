import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getJoinColumnName';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

export type TargetFieldInfo = {
  fieldName: string;
  joinColumnName?: string;
};

const findMorphTargetFieldInfo = (
  field: FieldMetadataItem,
  targetObjectMetadataId: string,
  objectMetadataItems: ObjectMetadataItem[],
): TargetFieldInfo | undefined => {
  if (!isDefined(field.morphRelations) || field.morphRelations.length === 0) {
    return undefined;
  }

  const matchingMorphRelation = field.morphRelations.find(
    (morphRelation) =>
      morphRelation.targetObjectMetadata.id === targetObjectMetadataId,
  );

  if (!isDefined(matchingMorphRelation)) {
    return undefined;
  }

  const targetObjectMetadata = objectMetadataItems.find(
    (item) => item.id === targetObjectMetadataId,
  );

  if (!isDefined(targetObjectMetadata)) {
    return undefined;
  }

  const fieldName = computeMorphRelationFieldName({
    fieldName: matchingMorphRelation.sourceFieldMetadata.name,
    relationType: matchingMorphRelation.type,
    targetObjectMetadataNameSingular: targetObjectMetadata.nameSingular,
    targetObjectMetadataNamePlural: targetObjectMetadata.namePlural,
  });

  // For morph relations, compute the join column name from the computed field name
  // e.g., caretakerPerson → caretakerPersonId
  return {
    fieldName,
    joinColumnName: `${fieldName}Id`,
  };
};

export const findTargetFieldInfo = (
  targetFields: FieldMetadataItem[],
  targetObjectMetadataId: string,
  objectMetadataItems: ObjectMetadataItem[],
): TargetFieldInfo | undefined => {
  for (const field of targetFields) {
    const morphResult = findMorphTargetFieldInfo(
      field,
      targetObjectMetadataId,
      objectMetadataItems,
    );

    if (isDefined(morphResult)) {
      return morphResult;
    }

    if (field.relation?.targetObjectMetadata.id === targetObjectMetadataId) {
      return {
        fieldName: field.name,
        joinColumnName: getJoinColumnName(field.settings),
      };
    }
  }

  return undefined;
};
