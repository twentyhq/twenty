import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldRelationMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

export const getActivityTargetJoinColumnName = ({
  activityTargetObjectMetadataItem,
  targetObjectNameSingular,
}: {
  activityTargetObjectMetadataItem: EnrichedObjectMetadataItem;
  targetObjectNameSingular: string;
}): string => {
  for (const field of activityTargetObjectMetadataItem.fields) {
    if (
      field.type === FieldMetadataType.MORPH_RELATION &&
      isDefined(field.morphRelations)
    ) {
      const morphRelation = field.morphRelations.find(
        (relation) =>
          relation.targetObjectMetadata.nameSingular ===
          targetObjectNameSingular,
      );

      if (isDefined(morphRelation)) {
        const sourceFieldName = morphRelation.sourceFieldMetadata.name;
        const joinFieldName =
          sourceFieldName === field.name
            ? `${field.name}${capitalize(targetObjectNameSingular)}`
            : sourceFieldName;

        return `${joinFieldName}Id`;
      }
    }

    if (
      field.relation?.targetObjectMetadata.nameSingular ===
      targetObjectNameSingular
    ) {
      const joinColumnName = (field.settings as FieldRelationMetadataSettings)
        ?.joinColumnName;

      return joinColumnName ?? `${field.name}Id`;
    }
  }

  return getActivityTargetObjectFieldIdName({
    nameSingular: targetObjectNameSingular,
  });
};
