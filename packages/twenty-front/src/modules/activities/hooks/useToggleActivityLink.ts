import { type ActivityLinkConfig } from '@/activities/hooks/useActivityLinkConfig';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type DocumentNode } from '@apollo/client';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useToggleActivityLink = ({
  targetRecord,
  activityLinkConfig,
  activityIds,
  timelineQuery,
}: {
  targetRecord: Pick<ActivityTargetableObject, 'id'>;
  activityLinkConfig: Pick<
    ActivityLinkConfig,
    | 'junctionObjectNameSingular'
    | 'activityJoinColumnName'
    | 'targetJoinColumnName'
  >;
  activityIds: string[];
  timelineQuery: DocumentNode;
}) => {
  const apolloCoreClient = useApolloCoreClient();
  const [pendingActivityIds, setPendingActivityIds] = useState<string[]>([]);

  const {
    junctionObjectNameSingular,
    activityJoinColumnName,
    targetJoinColumnName,
  } = activityLinkConfig;

  const { records: junctionRecords, refetch } = useFindManyRecords({
    objectNameSingular: junctionObjectNameSingular,
    filter: {
      [targetJoinColumnName]: { eq: targetRecord.id },
      [activityJoinColumnName]: { in: activityIds },
    },
    recordGqlFields: { id: true, [activityJoinColumnName]: true },
    skip: activityIds.length === 0,
  });

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: junctionObjectNameSingular,
  });
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: junctionObjectNameSingular,
  });

  const linkedActivityIds = new Set<string>(
    junctionRecords.map(
      (junctionRecord) => junctionRecord[activityJoinColumnName],
    ),
  );

  const toggleActivityLink = async (activityId: string) => {
    if (pendingActivityIds.includes(activityId)) {
      return;
    }

    setPendingActivityIds((currentIds) => [...currentIds, activityId]);

    try {
      const existingJunctionRecord = junctionRecords.find(
        (junctionRecord) =>
          junctionRecord[activityJoinColumnName] === activityId,
      );

      if (isDefined(existingJunctionRecord)) {
        await deleteOneRecord(existingJunctionRecord.id);
      } else {
        await createOneRecord({
          [activityJoinColumnName]: activityId,
          [targetJoinColumnName]: targetRecord.id,
        });
      }

      await Promise.all([
        refetch(),
        apolloCoreClient.refetchQueries({ include: [timelineQuery] }),
      ]);
    } finally {
      setPendingActivityIds((currentIds) =>
        currentIds.filter((id) => id !== activityId),
      );
    }
  };

  return { linkedActivityIds, pendingActivityIds, toggleActivityLink };
};
