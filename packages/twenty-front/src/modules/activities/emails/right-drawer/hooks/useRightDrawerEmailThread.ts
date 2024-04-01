import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { useRecoilValue } from 'recoil';

import { viewableEmailThreadIdState } from '@/activities/emails/states/viewableEmailThreadIdState';
import { EmailThreadMessage as EmailThreadMessageType } from '@/activities/emails/types/EmailThreadMessage';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useRightDrawerEmailThread = () => {
  const viewableEmailThreadId = useRecoilValue(viewableEmailThreadIdState);

  const apolloClient = useApolloClient();
  const thread = apolloClient.readFragment({
    id: `TimelineThread:${viewableEmailThreadId}`,
    fragment: gql`
      fragment timelineThread on TimelineThread {
        id
        subject
        lastMessageReceivedAt
      }
    `,
  });

  const {
    records: messages,
    loading,
    fetchMoreRecords,
  } = useFindManyRecords<EmailThreadMessageType>({
    depth: 3,
    limit: 10,
    filter: {
      messageThreadId: {
        eq: viewableEmailThreadId || '',
      },
    },
    objectNameSingular: CoreObjectNameSingular.Message,
    orderBy: {
      receivedAt: 'AscNullsLast',
    },
    skip: !viewableEmailThreadId,
  });

  const fetchMoreMessages = useCallback(() => {
    if (!loading) {
      fetchMoreRecords();
    }
  }, [fetchMoreRecords, loading]);

  return {
    thread,
    messages,
    loading,
    fetchMoreMessages,
  };
};
