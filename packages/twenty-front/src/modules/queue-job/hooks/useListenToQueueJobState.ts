import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type QueueJobBroadcastRecord } from '@/queue-job/types/QueueJobBroadcastRecord';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseListenToQueueJobStateArgs = {
  jobId?: string;
  onStateChange: (queueJob: QueueJobBroadcastRecord) => void;
};

export const useListenToQueueJobState = ({
  jobId,
  onStateChange,
}: UseListenToQueueJobStateArgs) => {
  const onQueueJobOperation = useCallback(
    ({
      operation,
    }: MetadataOperationBrowserEventDetail<QueueJobBroadcastRecord>) => {
      if (operation.type !== 'update' || operation.updatedRecord.id !== jobId) {
        return;
      }

      onStateChange(operation.updatedRecord);
    },
    [jobId, onStateChange],
  );

  useListenToMetadataOperationBrowserEvent<QueueJobBroadcastRecord>({
    metadataName: 'queueJob',
    onMetadataOperationBrowserEvent: onQueueJobOperation,
    skip: !isDefined(jobId),
  });
};
