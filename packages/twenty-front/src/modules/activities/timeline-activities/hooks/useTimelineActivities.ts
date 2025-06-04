import { useLinkedObjectsTitle } from '@/activities/timeline-activities/hooks/useLinkedObjectsTitle';
import { TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { isDefined } from 'twenty-shared/utils';

// do we need to test this?
export const useTimelineActivities = (
  targetableObject: ActivityTargetableObject,
) => {
  const { objectMetadataItem: timelineActivityObjectMetadata } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.TimelineActivity,
    });

  const { objectMetadataItem: targetObjectMetadata } = useObjectMetadataItem({
    // Ensure targetObjectNameSingular is a valid CoreObjectNameSingular if it comes from a variable source
    objectNameSingular:
      targetableObject.targetObjectNameSingular as CoreObjectNameSingular,
  });

  let filter = {};
  let skipQuery = false;

  if (
    targetableObject.targetObjectNameSingular === CoreObjectNameSingular.Product
  ) {
    if (isDefined(targetObjectMetadata)) {
      filter = {
        linkedRecordId: { eq: targetableObject.id },
        linkedObjectMetadataId: { eq: targetObjectMetadata.id },
      };
    } else {
      // If targetObjectMetadata for Product is not yet loaded, skip the query
      skipQuery = true;
    }
  } else {
    const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
      nameSingular: targetableObject.targetObjectNameSingular,
    });
    filter = {
      [targetableObjectFieldIdName]: {
        eq: targetableObject.id,
      },
    };
  }

  const {
    records: timelineActivities,
    loading: loadingTimelineActivities,
    fetchMoreRecords,
  } = useFindManyRecords<TimelineActivity>({
    objectNameSingular: CoreObjectNameSingular.TimelineActivity,
    filter,
    orderBy: [
      {
        createdAt: 'DescNullsFirst',
      },
    ],
    recordGqlFields: generateDepthOneRecordGqlFields({
      objectMetadataItem: timelineActivityObjectMetadata,
    }),
    fetchPolicy: 'cache-and-network',
    skip: skipQuery, // Skip query if necessary
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
