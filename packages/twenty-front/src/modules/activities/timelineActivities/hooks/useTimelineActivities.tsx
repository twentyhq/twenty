import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

// do we need to test this?
export const useTimelineActivities = (
  targetableObject: ActivityTargetableObject,
) => {
  const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: targetableObject.targetObjectNameSingular,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.TimelineActivity,
  });

  const {
    records: TimelineActivities,
    loading,
    fetchMoreRecords,
  } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.TimelineActivity,
    filter: {
      [targetableObjectFieldIdName]: {
        eq: targetableObject.id,
      },
    },
    orderBy: [
      {
        createdAt: 'DescNullsFirst',
      },
    ],
    recordGqlFields: generateDepthOneRecordGqlFields({ objectMetadataItem }),
    fetchPolicy: 'cache-and-network',
  });

  return {
    timelineActivities: TimelineActivities as TimelineActivity[],
    loading,
    fetchMoreRecords,
  };
};
