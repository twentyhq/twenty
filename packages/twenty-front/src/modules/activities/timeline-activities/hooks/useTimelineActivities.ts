import { useCallback, useMemo } from 'react';

import { useLinkedObjectsTitle } from '@/activities/timeline-activities/hooks/useLinkedObjectsTitle';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

// do we need to test this?
export const useTimelineActivities = (
  targetableObject: ActivityTargetableObject,
) => {
  const targetableObjectFieldIdName = `target${capitalize(targetableObject.targetObjectNameSingular)}Id`;

  const filter: RecordGqlOperationFilter = useMemo(
    () => ({
      [targetableObjectFieldIdName]: {
        eq: targetableObject.id,
      },
    }),
    [targetableObjectFieldIdName, targetableObject.id],
  );

  const { objectMetadataItem: timelineActivityMetadata } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.TimelineActivity,
    });

  const hasTimelineActivityField = timelineActivityMetadata.fields.some(
    (field) =>
      isDefined(field.morphRelations) &&
      field.morphRelations.some(
        (morphRelation) =>
          morphRelation.targetObjectMetadata?.nameSingular ===
          targetableObject.targetObjectNameSingular,
      ),
  );

  const { recordGqlFields: depthOneRecordGqlFields } =
    useGenerateDepthRecordGqlFieldsFromObject({
      objectNameSingular: CoreObjectNameSingular.TimelineActivity,
      depth: 1,
    });

  const {
    records: timelineActivities,
    loading: loadingTimelineActivities,
    fetchMoreRecords,
    refetch,
  } = useFindManyRecords<TimelineActivity>({
    skip: !hasTimelineActivityField,
    objectNameSingular: CoreObjectNameSingular.TimelineActivity,
    filter,
    orderBy: [
      {
        createdAt: 'DescNullsFirst',
      },
    ],
    recordGqlFields: depthOneRecordGqlFields,
    fetchPolicy: 'cache-and-network',
  });

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: CoreObjectNameSingular.TimelineActivity,
      variables: {
        filter,
      },
    }),
    [filter],
  );

  useListenToEventsForQuery({
    queryId: `timeline-activities-${targetableObject.targetObjectNameSingular}-${targetableObject.id}`,
    operationSignature,
    skip: !hasTimelineActivityField,
  });

  const handleTimelineActivityOperation = useCallback(() => {
    if (!hasTimelineActivityField) {
      return;
    }

    refetch();
  }, [hasTimelineActivityField, refetch]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleTimelineActivityOperation,
    objectMetadataItemId: timelineActivityMetadata.id,
  });

  const activityIds = timelineActivities
    .filter((timelineActivity) => timelineActivity.name.match(/note|task/i))
    .map((timelineActivity) => timelineActivity.linkedRecordId)
    .filter(isDefined);

  useLinkedObjectsTitle(activityIds);

  const firstQueryLoading =
    loadingTimelineActivities && timelineActivities.length === 0;

  const loadingMore =
    loadingTimelineActivities && timelineActivities.length > 0;

  return {
    timelineActivities,
    firstQueryLoading,
    loadingMore,
    fetchMoreRecords,
  };
};
