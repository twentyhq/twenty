import { useCallback, useMemo } from 'react';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { StandardObjectNameSingular } from 'twenty-shared/types';

export const useSubscribeToMessageThreadMessages = ({
  messageThreadId,
  refetchMessages,
}: {
  messageThreadId: string;
  refetchMessages: () => void;
}) => {
  const { objectMetadataItem: messageMetadataItem } = useObjectMetadataItem({
    objectNameSingular: StandardObjectNameSingular.Message,
  });

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: StandardObjectNameSingular.Message,
      variables: { filter: { messageThreadId: { eq: messageThreadId } } },
    }),
    [messageThreadId],
  );

  useListenToEventsForQuery({
    queryId: `message-thread-messages-${messageThreadId}`,
    operationSignature,
    onSseReconnected: refetchMessages,
  });

  const handleMessageOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      if (
        operation.type === 'create-one' &&
        operation.createdRecord.messageThreadId !== messageThreadId
      ) {
        return;
      }

      refetchMessages();
    },
    [messageThreadId, refetchMessages],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleMessageOperation,
    objectMetadataItemId: messageMetadataItem.id,
    operationTypes: ['create-one', 'create-many'],
  });
};
