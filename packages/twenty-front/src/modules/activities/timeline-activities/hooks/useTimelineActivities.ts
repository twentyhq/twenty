import { useLinkedObjectsTitle } from '@/activities/timeline-activities/hooks/useLinkedObjectsTitle';
import { TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
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
    records: timelineActivities,
    loading: loadingTimelineActivities,
    fetchMoreRecords,
  } = useFindManyRecords<TimelineActivity>({
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

  // NEW: Parse composite fields if they are returned as strings (e.g., JSON strings)
  const parsedTimelineActivities = timelineActivities.map((activity) => {
    if (
      activity.compositeField &&
      typeof activity.compositeField === 'string'
    ) {
      try {
        activity.compositeField = JSON.parse(activity.compositeField);
      } catch (error) {
        console.error('Error parsing composite field', error);
      }
    }
    return activity;
  });


  const activityIds = parsedTimelineActivities
    .filter((timelineActivity) => timelineActivity.name.match(/note|task/i))
    .map((timelineActivity) => timelineActivity.linkedRecordId);


  const { loading: loadingLinkedObjectsTitle } =
    useLinkedObjectsTitle(activityIds);


  const loading = loadingTimelineActivities || loadingLinkedObjectsTitle;


  return {
    timelineActivities: parsedTimelineActivities,
    loading,
    fetchMoreRecords,
  };
};
