import { renderHook } from '@testing-library/react';

import { METADATA_OPERATION_BROWSER_EVENT_NAME } from '@/browser-event/constants/MetadataOperationBrowserEventName';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { useListenToQueueJobState } from '@/queue-job/hooks/useListenToQueueJobState';
import { JobState } from '~/generated-metadata/graphql';

const JOB_ID = 'job-1';

const dispatchQueueJobUpdate = (jobId: string, state: JobState) => {
  dispatchMetadataOperationBrowserEvent({
    metadataName: 'queueJob',
    operation: {
      type: 'update',
      updatedRecord: { jobId, state, attemptsMade: 1, enqueuedAt: 1 },
    },
  });
};

describe('useListenToQueueJobState', () => {
  it('only forwards state changes of the listened job', () => {
    const onStateChange = jest.fn();

    renderHook(() =>
      useListenToQueueJobState({ jobId: JOB_ID, onStateChange }),
    );

    dispatchQueueJobUpdate('job-2', JobState.COMPLETED);
    dispatchQueueJobUpdate(JOB_ID, JobState.FAILED);

    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ jobId: JOB_ID, state: JobState.FAILED }),
    );
  });

  it('does not register a listener without a job id', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    renderHook(() => useListenToQueueJobState({ onStateChange: jest.fn() }));

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      METADATA_OPERATION_BROWSER_EVENT_NAME,
      expect.anything(),
    );

    addEventListenerSpy.mockRestore();
  });
});
