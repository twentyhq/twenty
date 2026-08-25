import {
  getActivityTargetJunctionConfig,
  type ActivityTargetJunctionConfig,
} from '@/activities/utils/getActivityTargetJunctionConfig';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useActivityTargetJunctionConfig = ({
  activityObjectNameSingular,
}: {
  activityObjectNameSingular: CoreObjectNameSingular;
}): ActivityTargetJunctionConfig | null => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const activityObjectMetadata = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === activityObjectNameSingular,
  );

  if (!isDefined(activityObjectMetadata)) {
    return null;
  }

  return getActivityTargetJunctionConfig({
    activityObjectMetadata,
    objectMetadataItems,
  });
};
