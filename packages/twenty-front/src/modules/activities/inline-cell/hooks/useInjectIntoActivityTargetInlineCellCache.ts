import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useOverwriteFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useOverwriteFindManyRecordsQueryInCache';

export const useInjectIntoActivityTargetInlineCellCache = () => {
  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const {
    overwriteFindManyRecordsQueryInCache:
      overwriteFindManyActivityTargetsQueryInCache,
  } = useOverwriteFindManyRecordsQueryInCache({
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
