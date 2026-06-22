import { useCallback, useMemo } from 'react';

import { useQuery } from '@apollo/client/react';

import { getTimelineActivityProjections } from '@/activities/timeline-activities/graphql/queries/getTimelineActivityProjections';
import { useLinkedObjectsTitle } from '@/activities/timeline-activities/hooks/useLinkedObjectsTitle';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { capitalize, isDefined, isNonEmptyArray } from 'twenty-shared/utils';

// A record inherits the timeline activities of related records (e.g. a company
// shows its people's notes & tasks). The server resolves which target columns +
// record ids to inherit; we OR those clauses into the base query so projected
// rows flow through the same live-updating, cached find-many as direct ones.
type TimelineActivityProjection = {
  targetColumnName: string;
  recordIds: string[];
  linkedObjectMetadataIds: string[];
};

type GetTimelineActivityProjectionsResult = {
  getTimelineActivityProjections: TimelineActivityProjection[];
};

// do we need to test this?
export const useTimelineActivities = (
  targetableObject: ActivityTargetableObject,
) => {
  const apolloCoreClient = useApolloCoreClient();

  const targetableObjectFieldIdName = `target${capitalize(targetableObject.targetObjectNameSingular)}Id`;

  const { data: projectionData } =
    useQuery<GetTimelineActivityProjectionsResult>(
      getTimelineActivityProjections,
      {
        client: apolloCoreClient,
        variables: {
          objectNameSingular: targetableObject.targetObjectNameSingular,
          recordId: targetableObject.id,
        },
      },
    );

  const projections = projectionData?.getTimelineActivityProjections;

  const filter: RecordGqlOperationFilter = useMemo(() => {
    const directFilter: RecordGqlOperationFilter = {
      [targetableObjectFieldIdName]: {
        eq: targetableObject.id,
      },
    };

    if (!isNonEmptyArray(projections)) {
      return directFilter;
    }

    return {
      or: [
        directFilter,
        ...projections.map((projection) => ({
          and: [
            { [projection.targetColumnName]: { in: projection.recordIds } },
            {
              linkedObjectMetadataId: {
                in: projection.linkedObjectMetadataIds,
              },
            },
          ],
        })),
      ],
    };
  }, [targetableObjectFieldIdName, targetableObject.id, projections]);

  const { objectMetadataItem: timelineActivityMetadata } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.TimelineActivity,
    });

  const { objectMetadataItem: noteObjectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Note,
  });

  const { objectMetadataItem: taskObjectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Task,
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

  const linkedRecordTitleObjectMetadataIds = [
    noteObjectMetadataItem.id,
    taskObjectMetadataItem.id,
  ];

  const activityIds = timelineActivities
    .filter(
      (timelineActivity) =>
        isDefined(timelineActivity.linkedObjectMetadataId) &&
        linkedRecordTitleObjectMetadataIds.includes(
          timelineActivity.linkedObjectMetadataId,
        ),
    )
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
