import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type JobStatus } from '~/generated-metadata/graphql';

type UseListenToQueueJobStateArgs = {
  jobId?: string;
  onStateChange: (jobStatus: JobStatus) => void;
};

export const useListenToQueueJobState = ({
  jobId,
  onStateChange,
}: UseListenToQueueJobStateArgs) => {
  const onQueueJobOperation = useCallback(
    ({ operation }: MetadataOperationBrowserEventDetail<JobStatus>) => {
      if (
        operation.type !== 'update' ||
        operation.updatedRecord.jobId !== jobId
      ) {
        return;
      }

      onStateChange(operation.updatedRecord);
    },
    [jobId, onStateChange],
  );

  useListenToMetadataOperationBrowserEvent<JobStatus>({
    metadataName: 'queueJob',
    onMetadataOperationBrowserEvent: onQueueJobOperation,
    skip: !isDefined(jobId),
  });
};
