import { getActivityTargetJunctionConfig } from '@/activities/utils/getActivityTargetJunctionConfig';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type CoreObjectNameSingular } from 'twenty-shared/types';

export const useActivityTargetFieldName = (
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: activityObjectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();

  return getActivityTargetJunctionConfig({
    activityObjectMetadata: objectMetadataItem,
    objectMetadataItems,
  })?.activityTargetField.name;
};
