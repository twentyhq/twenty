import { useCallback, useMemo } from 'react';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { StandardObjectNameSingular } from 'twenty-shared/types';

export const useSubscribeToMessageThreadMessages = ({
  messageThreadId,
  loadedMessageCount,
  refetchMessages,
}: {
  messageThreadId: string;
  loadedMessageCount: number;
  refetchMessages: () => void;
}) => {
  const { objectMetadataItem: messageMetadataItem } = useObjectMetadataItem({
    objectNameSingular: StandardObjectNameSingular.Message,
  });

  const queryId = useWorkspaceSurfaceScopedComponentInstanceId(
    `message-thread-messages-${messageThreadId}`,
  );

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: StandardObjectNameSingular.Message,
      variables: { filter: { messageThreadId: { eq: messageThreadId } } },
    }),
    [messageThreadId],
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
};
