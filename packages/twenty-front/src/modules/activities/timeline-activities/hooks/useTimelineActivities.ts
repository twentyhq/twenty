import { useLinkedObjectsTitle } from '@/activities/timeline-activities/hooks/useLinkedObjectsTitle';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { isDefined } from 'twenty-shared/utils';

// do we need to test this?
export const useTimelineActivities = (
  targetableObject: ActivityTargetableObject,
) => {
  const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: targetableObject.targetObjectNameSingular,
  });

  const { recordGqlFields: depthOneRecordGqlFields } =
    useGenerateDepthRecordGqlFieldsFromObject({
      objectNameSingular: CoreObjectNameSingular.TimelineActivity,
      depth: 1,
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
    recordGqlFields: depthOneRecordGqlFields,
    fetchPolicy: 'cache-and-network',
  });

  const activityIds = timelineActivities
    .filter((timelineActivity) => timelineActivity.name.match(/note|task/i))
    .map((timelineActivity) => timelineActivity.linkedRecordId)
    .filter(isDefined);

  const { loading: loadingLinkedObjectsTitle } =
    useLinkedObjectsTitle(activityIds);

  const loading = loadingTimelineActivities || loadingLinkedObjectsTitle;

  return {
    timelineActivities,
    loading,
    fetchMoreRecords,
  };
};
