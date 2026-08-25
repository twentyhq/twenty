import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { isDefined } from 'twenty-shared/utils';

export const getActivityTargetJunctionConfig = ({
  activityObjectMetadata,
  objectMetadataItems,
}: {
  activityObjectMetadata: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}) => {
  for (const fieldMetadataItem of activityObjectMetadata.fields) {
    if (!isJunctionRelationField(fieldMetadataItem)) {
      continue;
    }

    const junctionConfig = getJunctionConfig({
      settings: fieldMetadataItem.settings,
      relationObjectMetadataId:
        fieldMetadataItem.relation?.targetObjectMetadata.id ?? '',
      sourceObjectMetadataId: activityObjectMetadata.id,
      objectMetadataItems,
    });

    if (isDefined(junctionConfig) && junctionConfig.isMorphRelation) {
      return {
        ...junctionConfig,
        activityTargetField: fieldMetadataItem,
      };
    }
  }

  return null;
};
