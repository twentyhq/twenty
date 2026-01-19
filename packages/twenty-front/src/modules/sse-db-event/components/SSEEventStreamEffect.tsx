import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SseClientContext } from '@/sse-db-event/contexts/SseClientContext';
import { useSubscribeToSseEventStream } from '@/sse-db-event/hooks/useSubscribeToSseEventStream';
import { useContext, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const SSEEventStreamEffect = () => {
  const sseClient = useContext(SseClientContext);
  const { objectMetadataItems } = useObjectMetadataItems();

  const { subscribeToSseEventStream } = useSubscribeToSseEventStream();

  useEffect(() => {
    if (!isDefined(sseClient) || objectMetadataItems.length === 0) {
      return;
    }

    subscribeToSseEventStream(sseClient);
  }, [sseClient, subscribeToSseEventStream, objectMetadataItems]);

  return null;
};
