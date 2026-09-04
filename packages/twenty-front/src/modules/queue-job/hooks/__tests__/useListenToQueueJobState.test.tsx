import { renderHook } from '@testing-library/react';

import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { useListenToQueueJobState } from '@/queue-job/hooks/useListenToQueueJobState';
import { JobState } from '~/generated-metadata/graphql';

const JOB_ID = 'job-1';

const dispatchQueueJobUpdate = (id: string, state: JobState) => {
  dispatchMetadataOperationBrowserEvent({
    metadataName: 'queueJob',
    operation: {
      type: 'update',
      updatedRecord: {
        id,
        name: 'install-application',
        state,
        failedReason: null,
      },
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
      expect.objectContaining({ id: JOB_ID, state: JobState.FAILED }),
    );
  });

  it('does not listen without a job id', () => {
    const onStateChange = jest.fn();

    renderHook(() => useListenToQueueJobState({ onStateChange }));

    dispatchQueueJobUpdate(JOB_ID, JobState.COMPLETED);

    expect(onStateChange).not.toHaveBeenCalled();
  });
});
