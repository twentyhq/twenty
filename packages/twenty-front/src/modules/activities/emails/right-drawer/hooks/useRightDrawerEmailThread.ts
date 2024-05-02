import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { useRecoilValue } from 'recoil';

import { fetchAllThreadMessagesOperationSignatureFactory } from '@/activities/emails/graphql/operation-signatures/factories/fetchAllThreadMessagesOperationSignatureFactory';
import { viewableEmailThreadIdState } from '@/activities/emails/states/viewableEmailThreadIdState';
import { EmailThreadMessage as EmailThreadMessageType } from '@/activities/emails/types/EmailThreadMessage';
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

  const FETCH_ALL_MESSAGES_OPERATION_SIGNATURE =
    fetchAllThreadMessagesOperationSignatureFactory({
      messageThreadId: viewableEmailThreadId,
    });

  const {
    records: messages,
    loading,
    fetchMoreRecords,
  } = useFindManyRecords<EmailThreadMessageType>({
    limit: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.limit,
    filter: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.filter,
    objectNameSingular:
      FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.objectNameSingular,
    orderBy: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.orderBy,
    recordGqlFields: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.fields,
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
