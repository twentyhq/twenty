import { useCallback, useMemo } from 'react';

import { useLinkedRecordsIdentifiers } from '@/activities/timeline-activities/hooks/useLinkedRecordsIdentifiers';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { getTimelineActivityRecordGqlFields } from '@/activities/timeline-activities/utils/getTimelineActivityRecordGqlFields';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useSuspenseFindManyRecords } from '@/object-record/hooks/useSuspenseFindManyRecords';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useOnActivityReveal } from '@/ui/utilities/react-activity/hooks/useOnActivityReveal';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

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

  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const { objectMetadataItems: allObjectMetadataItems } =
    useObjectMetadataItems();

  const hasTimelineActivityField = timelineActivityMetadata.fields.some(
    (field) =>
      isDefined(field.morphRelations) &&
      field.morphRelations.some(
        (morphRelation) =>
          morphRelation.targetObjectMetadata?.nameSingular ===
          targetableObject.targetObjectNameSingular,
      ),
  );

  const recordGqlFields = useMemo(
    () =>
      getTimelineActivityRecordGqlFields({
        objectMetadataItems: allObjectMetadataItems,
        fields: timelineActivityMetadata.fields,
      }),
    [allObjectMetadataItems, timelineActivityMetadata.fields],
  );

  const {
    records: timelineActivities,
    fetchMoreRecords,
    isFetchingMoreRecords,
    refetch,
  } = useSuspenseFindManyRecords<TimelineActivity>({
    skip: !hasTimelineActivityField,
    objectNameSingular: CoreObjectNameSingular.TimelineActivity,
    filter,
    orderBy: [
      {
        happensAt: 'DescNullsFirst',
      },
    ],
    recordGqlFields,
    fetchPolicy: 'cache-and-network',
  });

  // Timeline rows are created server-side, so no optimistic cache write covers
  // changes made while this tab was hidden; revalidate whenever it is revealed.
  useOnActivityReveal(refetch);

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

  const { result: linkedRecordsByObjectNamePlural } =
    useLinkedRecordsIdentifiers({ timelineActivities, objectMetadataItems });

  return {
    timelineActivities,
    isFetchingMore: isFetchingMoreRecords,
    fetchMoreRecords,
    linkedRecords: Object.values(linkedRecordsByObjectNamePlural).flat(),
  };
};
