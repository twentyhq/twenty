import { useApolloClient } from '@apollo/client';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { CachedObjectRecordConnection } from '@/apollo/types/CachedObjectRecordConnection';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useModifyRecordFromCache } from '@/object-record/cache/hooks/useModifyRecordFromCache';
import { getCachedRecordEdgesFromRecords } from '@/object-record/cache/utils/getCachedRecordEdgesFromRecords';

export const useModifyActivityTargetsOnActivityCache = () => {
  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const modifyActivityFromCache = useModifyRecordFromCache({
    objectMetadataItem: objectMetadataItemActivity,
  });

  const apolloClient = useApolloClient();

  const modifyActivityTargetsOnActivityCache = ({
    activityId,
    activityTargets,
  }: {
    activityId: string;
    activityTargets: ActivityTarget[];
  }) => {
    modifyActivityFromCache(activityId, {
      activityTargets: (
        activityTargetsCachedConnection: CachedObjectRecordConnection,
      ) => {
        const newActivityTargetsCachedRecordEdges =
          getCachedRecordEdgesFromRecords({
            apolloClient,
            objectNameSingular: CoreObjectNameSingular.ActivityTarget,
            records: activityTargets,
          });

        return {
          ...activityTargetsCachedConnection,
          edges: newActivityTargetsCachedRecordEdges,
        };
      },
    });
  };

  return {
    modifyActivityTargetsOnActivityCache,
  };
};
