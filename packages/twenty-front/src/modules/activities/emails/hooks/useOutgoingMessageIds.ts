import { type MessageChannelMessageAssociation } from '@/activities/emails/types/MessageChannelMessageAssociation';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useMemo, useState } from 'react';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Null until the query settles: a message's side is unknown before then
export const useOutgoingMessageIds = (
  messageIds: string[],
): ReadonlySet<string> | null => {
  const {
    records: messageChannelMessageAssociations,
    totalCount,
    loading,
  } = useFindManyRecords<MessageChannelMessageAssociation>({
    objectNameSingular: CoreObjectNameSingular.MessageChannelMessageAssociation,
    filter: {
      messageId: { in: messageIds },
      direction: { eq: 'OUTGOING' },
    },
    recordGqlFields: { id: true, messageId: true },
    limit: QUERY_MAX_RECORDS,
    skip: messageIds.length === 0,
  });

  const loadedOutgoingMessageIds = useMemo(
    () =>
      // A failed or skipped query (no read access) settles without a count
      isDefined(totalCount) || !loading
        ? new Set(
            messageChannelMessageAssociations.map(({ messageId }) => messageId),
          )
        : null,
    [messageChannelMessageAssociations, totalCount, loading],
  );

  // New message ids start a new query; keep the last result until it returns
  const [lastOutgoingMessageIds, setLastOutgoingMessageIds] =
    useState<ReadonlySet<string> | null>(null);

  if (
    isDefined(loadedOutgoingMessageIds) &&
    loadedOutgoingMessageIds !== lastOutgoingMessageIds
  ) {
    setLastOutgoingMessageIds(loadedOutgoingMessageIds);
  }

  return loadedOutgoingMessageIds ?? lastOutgoingMessageIds;
};
