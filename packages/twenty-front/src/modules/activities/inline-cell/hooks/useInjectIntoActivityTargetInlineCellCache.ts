import { useApolloClient } from '@apollo/client';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useAddRecordInCache } from '@/object-record/cache/hooks/useAddRecordInCache';
import { useModifyRecordFromCache } from '@/object-record/cache/hooks/useModifyRecordFromCache';
import { useUpsertFindManyRecordsQueryInCacheV2 } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCacheV2';
import { getReferenceRecordConnectionFromRecords } from '@/object-record/cache/utils/getReferenceRecordConnectionFromRecords';

export const useInjectIntoActivityTargetInlineCellCache = () => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const modifyActivityFromCache = useModifyRecordFromCache({
    objectMetadataItem: objectMetadataItemActivity,
  });

  const addRecordInCache = useAddRecordInCache({
    objectMetadataItem: objectMetadataItemActivityTarget,
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

    for (const activityTargetToInject of activityTargetsToInject) {
      console.log({
        activityTargetToInject,
      });
      addRecordInCache(activityTargetToInject);
    }

    modifyActivityFromCache(activityId, {
      activityTargets: () => ({
        ...getReferenceRecordConnectionFromRecords({
          apolloClient,
          objectNameSingular: objectMetadataItemActivityTarget.nameSingular,
          records: activityTargetsToInject,
        }),
      }),
    });

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
