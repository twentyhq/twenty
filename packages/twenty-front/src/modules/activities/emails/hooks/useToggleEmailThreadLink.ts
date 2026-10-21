import { getTimelineThreadsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadsFromObjectRecord';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type MessageThreadTargetRecord = ObjectRecord & { messageThreadId: string };

export const useToggleEmailThreadLink = ({
  targetRecord,
  messageThreadTargetJoinColumnName,
  messageThreadIds,
}: {
  targetRecord: ActivityTargetableObject;
  messageThreadTargetJoinColumnName: string;
  messageThreadIds: string[];
}) => {
  const apolloCoreClient = useApolloCoreClient();
  const [pendingMessageThreadIds, setPendingMessageThreadIds] = useState<
    string[]
  >([]);

  const { records: messageThreadTargets, refetch } =
    useFindManyRecords<MessageThreadTargetRecord>({
      objectNameSingular: CoreObjectNameSingular.MessageThreadTarget,
      filter: {
        [messageThreadTargetJoinColumnName]: { eq: targetRecord.id },
        messageThreadId: { in: messageThreadIds },
      },
      recordGqlFields: { id: true, messageThreadId: true },
      skip: messageThreadIds.length === 0,
    });

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageThreadTarget,
  });
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageThreadTarget,
  });

  const linkedMessageThreadIds = new Set(
    messageThreadTargets.map(({ messageThreadId }) => messageThreadId),
  );

  const toggleEmailThreadLink = async (messageThreadId: string) => {
    if (pendingMessageThreadIds.includes(messageThreadId)) {
      return;
    }

    setPendingMessageThreadIds((currentIds) => [
      ...currentIds,
      messageThreadId,
    ]);

    try {
      const existingMessageThreadTarget = messageThreadTargets.find(
        (messageThreadTarget) =>
          messageThreadTarget.messageThreadId === messageThreadId,
      );

      if (isDefined(existingMessageThreadTarget)) {
        await deleteOneRecord(existingMessageThreadTarget.id);
      } else {
        await createOneRecord({
          messageThreadId,
          [messageThreadTargetJoinColumnName]: targetRecord.id,
        });
      }

      await Promise.all([
        refetch(),
        apolloCoreClient.refetchQueries({
          include: [getTimelineThreadsFromObjectRecord],
        }),
      ]);
    } finally {
      setPendingMessageThreadIds((currentIds) =>
        currentIds.filter((id) => id !== messageThreadId),
      );
    }
  };

  return {
    linkedMessageThreadIds,
    pendingMessageThreadIds,
    toggleEmailThreadLink,
  };
};
