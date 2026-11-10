import { useCallback, useMemo } from 'react';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useSubscribeToMessageThreadMessages = ({
  messageThreadId,
  loadedMessageIds,
  refetchMessages,
}: {
  messageThreadId: string;
  loadedMessageIds: string[];
  refetchMessages: () => void;
}) => {
  const { objectMetadataItem: messageMetadataItem } = useObjectMetadataItem({
    objectNameSingular: StandardObjectNameSingular.Message,
  });
  const { objectMetadataItem: attachmentMetadataItem } = useObjectMetadataItem({
    objectNameSingular: StandardObjectNameSingular.Attachment,
  });
  const isMessageAttachmentEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MESSAGE_ATTACHMENT_ENABLED,
  );
  const loadedMessageCount = loadedMessageIds.length;
  const loadedMessageIdsKey = loadedMessageIds.join(',');

  const queryId = useWorkspaceSurfaceScopedComponentInstanceId(
    `message-thread-messages-${messageThreadId}`,
  );
  // Listeners are matched by query id only, so a new filter needs a new id
  const attachmentsQueryId = useWorkspaceSurfaceScopedComponentInstanceId(
    `message-thread-attachments-${messageThreadId}-${loadedMessageCount}-${loadedMessageIds.at(-1) ?? ''}`,
  );

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: StandardObjectNameSingular.Message,
      variables: { filter: { messageThreadId: { eq: messageThreadId } } },
    }),
    [messageThreadId],
  );

  // Apps attach files to an already ingested message, which creates no message event
  const attachmentOperationSignature = useMemo(
    () => ({
      objectNameSingular: StandardObjectNameSingular.Attachment,
      variables: {
        filter: {
          targetMessageId: { in: loadedMessageIdsKey.split(',') },
        },
      },
    }),
    [loadedMessageIdsKey],
  );

  const refetchMessagesIfSinglePage = useCallback(() => {
    // refetch resets to the first page and would drop pages loaded through fetchMore
    if (loadedMessageCount > QUERY_MAX_RECORDS) {
      return;
    }

    refetchMessages();
  }, [loadedMessageCount, refetchMessages]);

  useListenToEventsForQuery({
    queryId,
    operationSignature,
    onSseReconnected: refetchMessagesIfSinglePage,
  });

  const handleMessageOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      if (
        operation.type === 'create-one' &&
        operation.createdRecord.messageThreadId !== messageThreadId
      ) {
        return;
      }

      refetchMessagesIfSinglePage();
    },
    [messageThreadId, refetchMessagesIfSinglePage],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleMessageOperation,
    objectMetadataItemId: messageMetadataItem.id,
    operationTypes: ['create-one', 'create-many'],
  });

  const isListeningToAttachments =
    isMessageAttachmentEnabled && loadedMessageCount > 0;

  useListenToEventsForQuery({
    queryId: attachmentsQueryId,
    operationSignature: attachmentOperationSignature,
    skip: !isListeningToAttachments,
  });

  const handleAttachmentOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      if (
        operation.type === 'create-one' &&
        !loadedMessageIdsKey
          .split(',')
          .includes(operation.createdRecord.targetMessageId)
      ) {
        return;
      }

      refetchMessagesIfSinglePage();
    },
    [loadedMessageIdsKey, refetchMessagesIfSinglePage],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleAttachmentOperation,
    objectMetadataItemId: attachmentMetadataItem.id,
    operationTypes: ['create-one', 'create-many'],
    enabled: isListeningToAttachments,
  });
};
