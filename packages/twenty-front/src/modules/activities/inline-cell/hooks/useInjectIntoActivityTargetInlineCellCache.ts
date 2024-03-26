import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpsertFindManyRecordsQueryInCacheV2 } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCacheV2';

export const useInjectIntoActivityTargetInlineCellCache = () => {
  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const {
    upsertFindManyRecordsQueryInCache:
      overwriteFindManyActivityTargetsQueryInCache,
  } = useUpsertFindManyRecordsQueryInCacheV2({
    objectMetadataItem: objectMetadataItemActivityTarget,
  });

  const injectIntoActivityTargetInlineCellCache = ({
    activityId,
    activityTargetsToInject,
  }: {
    activityId: string;
    activityTargetsToInject: ActivityTarget[];
  }) => {
    const activityTargetInlineCellQueryVariables = {
      filter: {
        activityId: {
          eq: activityId,
        },
      },
    };

    overwriteFindManyActivityTargetsQueryInCache({
      queryVariables: activityTargetInlineCellQueryVariables,
      objectRecordsToOverwrite: activityTargetsToInject,
      queryFields: {
        id: true,
        __typename: true,
        activity: {
          id: true,
          __typename: true,
        },
      },
    });
  };

  return {
    injectIntoActivityTargetInlineCellCache,
  };
};
