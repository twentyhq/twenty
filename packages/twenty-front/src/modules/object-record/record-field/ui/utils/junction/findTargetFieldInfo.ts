import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type FieldRelationMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

export type TargetFieldInfo = {
  fieldName: string;
  settings: FieldRelationMetadataSettings;
};

export const findTargetFieldInfo = (
  targetFields: FieldMetadataItem[],
  targetObjectMetadataId: string,
  objectMetadataItems: ObjectMetadataItem[],
): TargetFieldInfo | undefined => {
  for (const field of targetFields) {
    // Check morphRelations first - fields with morphId may have this populated
    if (isDefined(field.morphRelations) && field.morphRelations.length > 0) {
      const matchingMorphRelation = field.morphRelations.find(
        (morphRelation) =>
          morphRelation.targetObjectMetadata.id === targetObjectMetadataId,
      );

      if (isDefined(matchingMorphRelation)) {
        const targetObjectMetadata = objectMetadataItems.find(
          (item) => item.id === targetObjectMetadataId,
        );

        if (isDefined(targetObjectMetadata)) {
          const fieldName = computeMorphRelationFieldName({
            fieldName: matchingMorphRelation.sourceFieldMetadata.name,
            relationType: matchingMorphRelation.type,
            targetObjectMetadataNameSingular: targetObjectMetadata.nameSingular,
            targetObjectMetadataNamePlural: targetObjectMetadata.namePlural,
          });
          // For morph relations, don't pass settings because the field's joinColumnName
          // refers to the first/primary target, not the computed target field name.
          return { fieldName, settings: undefined };
        }
      }
    } else if (
      field.relation?.targetObjectMetadata.id === targetObjectMetadataId
    ) {
      // For regular relations, use the field name and settings directly
      return {
        fieldName: field.name,
        settings: field.settings as FieldRelationMetadataSettings,
      };
    }
  }
  return undefined;
};

