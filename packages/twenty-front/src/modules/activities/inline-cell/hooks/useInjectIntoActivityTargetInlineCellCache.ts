import { useRecoilValue } from 'recoil';

import { FIND_MANY_ACTIVITY_TARGETS_QUERY_KEY } from '@/activities/query-keys/FindManyActivityTargetsQueryKey';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';

export const useInjectIntoActivityTargetInlineCellCache = () => {
  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

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
      depth: FIND_MANY_ACTIVITY_TARGETS_QUERY_KEY.depth,
      queryFields:
        FIND_MANY_ACTIVITY_TARGETS_QUERY_KEY.fieldsFactory?.(
          objectMetadataItems,
        ),
      computeReferences: true,
    });
  };

  return {
    injectIntoActivityTargetInlineCellCache,
  };
};
