import { useApolloClient } from '@apollo/client';

import { Activity } from '@/activities/types/Activity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useModifyRecordFromCache } from '@/object-record/cache/hooks/useModifyRecordFromCache';
import { getCacheReferenceFromRecord } from '@/object-record/cache/utils/getCacheReferenceFromRecord';

export const useModifyActivityOnActivityTargetsCache = () => {
  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const modifyActivityTargetFromCache = useModifyRecordFromCache({
    objectMetadataItem: objectMetadataItemActivityTarget,
  });

  const apolloClient = useApolloClient();

  const modifyActivityOnActivityTargetsCache = ({
    activityTargetIds,
    activity,
  }: {
    activityTargetIds: string[];
    activity: Activity;
  }) => {
    for (const activityTargetId of activityTargetIds) {
      modifyActivityTargetFromCache(activityTargetId, {
        activity: () => {
          const newActivityReference = getCacheReferenceFromRecord({
            apolloClient,
            objectNameSingular: CoreObjectNameSingular.Activity,
            record: activity,
          });

          return newActivityReference;
        },
      });
    }
  };

  return {
    modifyActivityOnActivityTargetsCache,
  };
};
