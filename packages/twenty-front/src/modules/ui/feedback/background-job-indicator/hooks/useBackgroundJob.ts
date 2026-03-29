import { useCallback } from 'react';

import {
  backgroundJobsState,
  type BackgroundJobData,
  type BackgroundJobStatus,
} from '@/ui/feedback/background-job-indicator/states/backgroundJobState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useBackgroundJob = () => {
  const setJobs = useSetAtomState(backgroundJobsState);

  const upsertJob = useCallback(
    (job: BackgroundJobData) => {
      setJobs((prev) => {
        const idx = prev.findIndex((j) => j.id === job.id);

        if (idx >= 0) {
          const updated = [...prev];

          updated[idx] = job;

          return updated;
        }

        return [...prev, job];
      });
    },
    [setJobs],
  );

  const removeJob = useCallback(
    (jobId: string) => {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    },
    [setJobs],
  );

  const updateJobStatus = useCallback(
    (
      jobId: string,
      updates: Partial<
        Pick<
          BackgroundJobData,
          | 'status'
          | 'processedItems'
          | 'successCount'
          | 'warningCount'
          | 'failureCount'
        >
      >,
    ) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, ...updates } : j)),
      );
    },
    [setJobs],
  );

  return { upsertJob, removeJob, updateJobStatus };
};

export const useBackgroundJobs = () => {
  return useAtomStateValue(backgroundJobsState);
};
