import { type MessageChannelMessageAssociation } from '@/activities/emails/types/MessageChannelMessageAssociation';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useMemo } from 'react';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const useOutgoingMessageIds = (messageIds: string[]) => {
  const { records: messageChannelMessageAssociations } =
    useFindManyRecords<MessageChannelMessageAssociation>({
      objectNameSingular:
        CoreObjectNameSingular.MessageChannelMessageAssociation,
      filter: {
        messageId: { in: messageIds },
        direction: { eq: 'OUTGOING' },
      },
      recordGqlFields: { id: true, messageId: true },
      limit: QUERY_MAX_RECORDS,
      skip: messageIds.length === 0,
    });

  return useMemo(
    () =>
      new Set(
        messageChannelMessageAssociations.map(({ messageId }) => messageId),
      ),
    [messageChannelMessageAssociations],
  );
};
