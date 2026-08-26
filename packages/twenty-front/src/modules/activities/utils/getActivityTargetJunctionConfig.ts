import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getSourceJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getSourceJoinColumnName';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { isDefined } from 'twenty-shared/utils';

export type ActivityTargetJunctionConfig = {
  junctionObjectMetadata: EnrichedObjectMetadataItem;
  // Field on the activity holding the junction records, e.g. `note.noteTargets`
  activityTargetField: FieldMetadataItem;
  // Field on the junction pointing back at the activity, e.g. `noteTarget.note`
  activityRelationField: FieldMetadataItem;
  // Join column of the activity on the junction, e.g. `noteTarget.noteId`
  activityJoinColumnName: string;
};

// An activity can be attached to any searchable object, so its junction always reaches its
// targets through a morph relation. Any other junction on the activity is a regular one.
export const getActivityTargetJunctionConfig = ({
  activityObjectMetadata,
  objectMetadataItems,
}: {
  activityObjectMetadata: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): ActivityTargetJunctionConfig | null => {
  for (const activityTargetField of activityObjectMetadata.fields) {
    if (!isJunctionRelationField(activityTargetField)) {
      continue;
    }

    const junctionConfig = getJunctionConfig({
      settings: activityTargetField.settings,
      relationObjectMetadataId:
        activityTargetField.relation?.targetObjectMetadata.id ?? '',
      sourceObjectMetadataId: activityObjectMetadata.id,
      objectMetadataItems,
    });

    if (
      !junctionConfig?.isMorphRelation ||
      !isDefined(junctionConfig.sourceField)
    ) {
      continue;
    }

    const junctionObjectMetadata = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id === junctionConfig.junctionObjectMetadata.id,
    );

    const activityJoinColumnName = getSourceJoinColumnName({
      sourceField: junctionConfig.sourceField,
      sourceObjectMetadata: activityObjectMetadata,
    });

    if (
      !isDefined(junctionObjectMetadata) ||
      !isDefined(activityJoinColumnName)
    ) {
      continue;
    }

    return {
      junctionObjectMetadata,
      activityTargetField,
      activityRelationField: junctionConfig.sourceField,
      activityJoinColumnName,
    };
  }

  return null;
};
