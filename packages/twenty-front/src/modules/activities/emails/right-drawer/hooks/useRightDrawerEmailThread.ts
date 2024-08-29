import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { fetchAllThreadMessagesOperationSignatureFactory } from '@/activities/emails/graphql/operation-signatures/factories/fetchAllThreadMessagesOperationSignatureFactory';
import { EmailThread } from '@/activities/emails/types/EmailThread';
import { EmailThreadMessage } from '@/activities/emails/types/EmailThreadMessage';

import { MessageChannel } from '@/accounts/types/MessageChannel';
import { MessageChannelMessageAssociation } from '@/activities/emails/types/MessageChannelMessageAssociation';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const useRightDrawerEmailThread = () => {
  const viewableRecordId = useRecoilValue(viewableRecordIdState);
  const { upsertRecords } = useUpsertRecordsInStore();
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [lastMessageChannelId, setLastMessageChannelId] = useState<
    string | null
  >(null);
  const [isMessagesFetchComplete, setIsMessagesFetchComplete] = useState(false);

  const { record: thread } = useFindOneRecord<EmailThread>({
    objectNameSingular: CoreObjectNameSingular.MessageThread,
    objectRecordId: viewableRecordId ?? '',
    recordGqlFields: {
      id: true,
    },
    onCompleted: (record) => {
      upsertRecords([record]);
    },
  });

  const isMessageThreadSubscribersEnabled = useIsFeatureEnabled(
    'IS_MESSAGE_THREAD_SUBSCRIBER_ENABLED',
  );

  const FETCH_ALL_MESSAGES_OPERATION_SIGNATURE =
    fetchAllThreadMessagesOperationSignatureFactory({
      messageThreadId: viewableRecordId,
      isSubscribersEnabled: isMessageThreadSubscribersEnabled,
    });

  const {
    records: messages,
    loading: messagesLoading,
    fetchMoreRecords,
    hasNextPage,
  } = useFindManyRecords<EmailThreadMessage>({
    limit: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.limit,
    filter: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.filter,
    objectNameSingular:
      FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.objectNameSingular,
    orderBy: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.orderBy,
    recordGqlFields: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.fields,
    skip: !viewableRecordId,
  });

  const fetchMoreMessages = useCallback(() => {
    if (!messagesLoading && hasNextPage) {
      fetchMoreRecords();
    } else if (!hasNextPage) {
      setIsMessagesFetchComplete(true);
    }
  }, [fetchMoreRecords, messagesLoading, hasNextPage]);

  useEffect(() => {
    if (messages.length > 0 && isMessagesFetchComplete) {
      const lastMessage = messages[messages.length - 1];
      setLastMessageId(lastMessage.id);
    }
  }, [messages, isMessagesFetchComplete]);

  const { records: messageChannelMessageAssociationData } =
    useFindManyRecords<MessageChannelMessageAssociation>({
      filter: {
        messageId: {
          eq: lastMessageId ?? '',
        },
      },
      objectNameSingular:
        CoreObjectNameSingular.MessageChannelMessageAssociation,
      recordGqlFields: {
        id: true,
        messageId: true,
        messageChannelId: true,
        messageThreadExternalId: true,
      },
      skip: !lastMessageId || !isMessagesFetchComplete,
    });

  useEffect(() => {
    if (messageChannelMessageAssociationData.length > 0) {
      setLastMessageChannelId(
        messageChannelMessageAssociationData[0].messageChannelId,
      );
    }
  }, [messageChannelMessageAssociationData]);

  const { records: messageChannelData, loading: messageChannelLoading } =
    useFindManyRecords<MessageChannel>({
      filter: {
        id: {
          eq: lastMessageChannelId ?? '',
        },
      },
      objectNameSingular: CoreObjectNameSingular.MessageChannel,
      recordGqlFields: {
        id: true,
        handle: true,
        connectedAccountId: true,
      },
      skip: !lastMessageChannelId,
    });

  const messageThreadExternalId =
    messageChannelMessageAssociationData.length > 0
      ? messageChannelMessageAssociationData[0].messageThreadExternalId
      : null;
  const connectedAccountHandle =
    messageChannelData.length > 0 ? messageChannelData[0].handle : null;

  return {
    thread,
    messages,
    messageThreadExternalId,
    connectedAccountHandle,
    threadLoading: messagesLoading,
    messageChannelLoading,
    fetchMoreMessages,
  };
};
