import { useCallback, useEffect, useState } from 'react';

import { fetchAllThreadMessagesOperationSignatureFactory } from '@/activities/emails/graphql/operation-signatures/factories/fetchAllThreadMessagesOperationSignatureFactory';
import { useReplyConnectedAccount } from '@/activities/emails/hooks/useReplyConnectedAccount';
import { type EmailThread } from '@/activities/emails/types/EmailThread';
import { type EmailThreadMessage } from '@/activities/emails/types/EmailThreadMessage';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { type MessageChannelMessageAssociation } from '@/activities/emails/types/MessageChannelMessageAssociation';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  StandardObjectNameSingular,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useEmailThread = (threadId: string | null) => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { channels: viewerMessageChannels } = useMyMessageChannels();
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [isMessagesFetchComplete, setIsMessagesFetchComplete] = useState(false);
  const isMessageAttachmentEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MESSAGE_ATTACHMENT_ENABLED,
  );

  const { record: thread, loading: threadRecordLoading } =
    useFindOneRecord<EmailThread>({
      objectNameSingular: StandardObjectNameSingular.MessageThread,
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
      isMessageAttachmentEnabled,
    });

  const {
    records: messages,
    loading: messagesLoading,
    fetchMoreRecords,
    hasNextPage,
    refetch: refetchMessages,
    queryIdentifier: messagesQueryIdentifier,
  } = useFindManyRecords<EmailThreadMessage>({
    limit: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.limit,
    filter: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.filter,
    objectNameSingular:
      FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.objectNameSingular,
    orderBy: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.orderBy,
    recordGqlFields: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.fields,
    skip: !threadId,
  });

  const isFetchingMoreRecords = useAtomFamilyStateValue(
    isFetchingMoreRecordsFamilyState,
    messagesQueryIdentifier,
  );

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
      limit: FETCH_ALL_MESSAGES_OPERATION_SIGNATURE.variables.limit,
      filter: {
        messageId: {
          in: messages.map(({ id }) => id),
        },
        role: {
          eq: MessageParticipantRole.FROM,
        },
      },
      objectNameSingular: StandardObjectNameSingular.MessageParticipant,
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

  const {
    records: messageChannelMessageAssociations,
    loading: messageChannelMessageAssociationLoading,
  } = useFindManyRecords<MessageChannelMessageAssociation>({
    filter: {
      messageId: {
        eq: lastMessageId ?? '',
      },
    },
    objectNameSingular:
      StandardObjectNameSingular.MessageChannelMessageAssociation,
    recordGqlFields: {
      id: true,
      messageId: true,
      messageChannelId: true,
      messageThreadExternalId: true,
      messageExternalId: true,
    },
    skip: !lastMessageId || !isMessagesFetchComplete,
  });

  const viewerMessageChannelIds = new Set(
    viewerMessageChannels.map(({ id }) => id),
  );

  const isLastMessageInThread = messages.some(({ id }) => id === lastMessageId);

  const lastMessageAssociations = isLastMessageInThread
    ? messageChannelMessageAssociations.filter(
        ({ messageId }) => messageId === lastMessageId,
      )
    : [];

  const resolvedLastMessageAssociation =
    lastMessageAssociations.find(({ messageChannelId }) =>
      viewerMessageChannelIds.has(messageChannelId),
    ) ?? lastMessageAssociations[0];

  // Otherwise the chat composer unmounts while a new message's association loads
  const [previousLastMessageAssociation, setPreviousLastMessageAssociation] =
    useState<{
      threadId: string | null;
      association: MessageChannelMessageAssociation;
    } | null>(null);

  if (
    isDefined(resolvedLastMessageAssociation) &&
    (previousLastMessageAssociation?.association.id !==
      resolvedLastMessageAssociation.id ||
      previousLastMessageAssociation.threadId !== threadId)
  ) {
    setPreviousLastMessageAssociation({
      threadId,
      association: resolvedLastMessageAssociation,
    });
  }

  const lastMessageAssociation =
    resolvedLastMessageAssociation ??
    (previousLastMessageAssociation?.threadId === threadId
      ? previousLastMessageAssociation.association
      : undefined);
  const messageThreadExternalId =
    lastMessageAssociation?.messageThreadExternalId ?? null;
  const lastMessageExternalId =
    lastMessageAssociation?.messageExternalId ?? null;
  const lastMessageChannelId = lastMessageAssociation?.messageChannelId ?? null;

  const {
    connectedAccountId,
    connectedAccountHandle,
    connectedAccountProvider,
    messageChannelHandle,
    loading: replyConnectedAccountLoading,
  } = useReplyConnectedAccount(lastMessageChannelId);

  const messagesWithSender: EmailThreadMessageWithSender[] = messages.map(
    (message) => ({
      ...message,
      sender:
        messageSenders.find(
          (messageSender) => messageSender.messageId === message.id,
        ) ??
        message.messageParticipants.find(
          (participant) => participant.role === MessageParticipantRole.FROM,
        ),
    }),
  );

  const messageChannelLoading =
    replyConnectedAccountLoading || messageChannelMessageAssociationLoading;

  return {
    thread,
    messages: messagesWithSender,
    messageThreadExternalId,
    connectedAccountId,
    connectedAccountHandle,
    connectedAccountProvider,
    messageChannelHandle,
    threadLoading: threadRecordLoading || messagesLoading,
    isFetchingMoreMessages: isFetchingMoreRecords,
    messageChannelLoading,
    lastMessageExternalId,
    lastMessageChannelId,
    fetchMoreMessages,
    refetchMessages,
  };
};
