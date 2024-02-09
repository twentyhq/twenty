import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';

export const useInjectIntoActivityTargetInlineCellCache = () => {
  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const {
    upsertFindManyRecordsQueryInCache:
      overwriteFindManyActivityTargetsQueryInCache,
  } = useUpsertFindManyRecordsQueryInCache({
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
    });
  };

  return {
    injectIntoActivityTargetInlineCellCache,
  };
};
