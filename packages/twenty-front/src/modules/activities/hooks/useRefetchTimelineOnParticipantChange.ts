import { useCallback, useMemo } from 'react';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';

type UseRefetchTimelineOnParticipantChangeParams = {
  queryId: string;
  participantObjectNameSingular: string;
  relatedPersonIds: string[];
  refetch: () => void;
};

export const useRefetchTimelineOnParticipantChange = ({
  queryId,
  participantObjectNameSingular,
  relatedPersonIds,
  refetch,
}: UseRefetchTimelineOnParticipantChangeParams) => {
  const { objectMetadataItem: participantMetadata } = useObjectMetadataItem({
    objectNameSingular: participantObjectNameSingular,
  });

  const hasRelatedPersonIds = relatedPersonIds.length > 0;

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: participantObjectNameSingular,
      variables: { filter: { personId: { in: relatedPersonIds } } },
    }),
    [participantObjectNameSingular, relatedPersonIds],
  );

  useListenToEventsForQuery({
    queryId,
    operationSignature,
    skip: !hasRelatedPersonIds,
  });

  const handleParticipantOperation = useCallback(() => {
    if (!hasRelatedPersonIds) {
      return;
    }

    refetch();
  }, [hasRelatedPersonIds, refetch]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleParticipantOperation,
    objectMetadataItemId: participantMetadata.id,
  });
};
