import { useQuery } from '@apollo/client/react';
import { useCallback, useEffect, useState } from 'react';

import { fetchAllThreadMessagesOperationSignatureFactory } from '@/activities/emails/graphql/operation-signatures/factories/fetchAllThreadMessagesOperationSignatureFactory';
import { type EmailThread } from '@/activities/emails/types/EmailThread';
import { type EmailThreadMessage } from '@/activities/emails/types/EmailThreadMessage';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { type MessageChannelMessageAssociation } from '@/activities/emails/types/MessageChannelMessageAssociation';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import {
  type ConnectedAccountProvider,
  CoreObjectNameSingular,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useEmailThread = (threadId: string | null) => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [isMessagesFetchComplete, setIsMessagesFetchComplete] = useState(false);

  const { record: thread } = useFindOneRecord<EmailThread>({
    objectNameSingular: CoreObjectNameSingular.MessageThread,
    objectRecordId: threadId ?? '',
    recordGqlFields: {
      id: true,
    },
  });

  useEffect(() => {
    if (thread) {
      upsertRecordsInStore({ partialRecords: [thread] });
    }
  }, [thread, upsertRecordsInStore]);

  const FETCH_ALL_MESSAGES_OPERATION_SIGNATURE =
    fetchAllThreadMessagesOperationSignatureFactory({
      messageThreadId: threadId,
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
    skip: !threadId,
  });

  const fetchMoreMessages = useCallback(() => {
    if (!messagesLoading && hasNextPage) {
      fetchMoreRecords();
    } else if (!hasNextPage) {
      setIsMessagesFetchComplete(true);
    }
  }, [fetchMoreRecords, messagesLoading, hasNextPage]);

  // When all messages fit in the first page, fetchMoreMessages is never called,
  // so we need to mark fetch as complete here to unblock downstream queries
  useEffect(() => {
    if (!messagesLoading && !hasNextPage) {
      setIsMessagesFetchComplete(true);
    }
  }, [messagesLoading, hasNextPage]);

  useEffect(() => {
    if (messages.length > 0 && isMessagesFetchComplete) {
      const lastMessage = messages[messages.length - 1];

      setLastMessageId(lastMessage.id);
    }
  }, [messages, isMessagesFetchComplete]);

  const { records: messageSenders } =
    useFindManyRecords<EmailThreadMessageParticipant>({
      filter: {
        messageId: {
          in: messages.map(({ id }) => id),
        },
        role: {
          eq: MessageParticipantRole.FROM,
        },
      },
      objectNameSingular: CoreObjectNameSingular.MessageParticipant,
      recordGqlFields: {
        id: true,
        role: true,
        displayName: true,
        messageId: true,
        handle: true,
        person: true,
        workspaceMember: true,
      },
      skip: messages.length === 0,
    });

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
        messageExternalId: true,
      },
      skip: !lastMessageId || !isMessagesFetchComplete,
    });

  const messageThreadExternalId =
    messageChannelMessageAssociationData.length > 0
      ? messageChannelMessageAssociationData[0].messageThreadExternalId
      : null;
  const lastMessageExternalId =
    messageChannelMessageAssociationData.length > 0
      ? messageChannelMessageAssociationData[0].messageExternalId
      : null;

  const messagesWithSender: EmailThreadMessageWithSender[] = messages
    .map((message) => {
      const sender = messageSenders.find(
        (messageSender) => messageSender.messageId === message.id,
      );

      if (!sender) {
        return null;
      }

      return {
        ...message,
        sender,
      };
    })
    .filter(isDefined);

  // connectedAccount and messageChannel live in the core schema,
  // so we resolve the account from the core myConnectedAccounts query
  // rather than the workspace-level messageChannel records.
  const { data: myConnectedAccountsData, loading: messageChannelLoading } =
    useQuery<{
      myConnectedAccounts: {
        id: string;
        handle: string;
        provider: ConnectedAccountProvider;
      }[];
    }>(GET_MY_CONNECTED_ACCOUNTS);

  const resolvedConnectedAccount =
    myConnectedAccountsData?.myConnectedAccounts[0] ?? null;

  const connectedAccountId = resolvedConnectedAccount?.id ?? null;
  const connectedAccountHandle = resolvedConnectedAccount?.handle ?? null;
  const connectedAccountProvider = resolvedConnectedAccount?.provider ?? null;

  return {
    thread,
    messages: messagesWithSender,
    messageThreadExternalId,
    connectedAccountId,
    connectedAccountHandle,
    connectedAccountProvider,
    threadLoading: messagesLoading,
    messageChannelLoading,
    lastMessageExternalId,
    fetchMoreMessages,
  };
};
