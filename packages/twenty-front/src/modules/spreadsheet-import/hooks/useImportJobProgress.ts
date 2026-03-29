import { useApolloClient } from '@apollo/client/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { GET_IMPORT_JOB } from '@/spreadsheet-import/graphql/queries/importJob';
import { useBackgroundJob } from '@/ui/feedback/background-job-indicator/hooks/useBackgroundJob';
import { t } from '@lingui/core/macro';

const IMPORT_JOB_STORAGE_KEY = 'activeImportJobId';
const POLL_INTERVAL_MS = 3000;

type ImportJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

type ImportJobData = {
  id: string;
  status: ImportJobStatus;
  processedRecords: number;
  totalRecords: number;
  successCount: number;
  warningCount: number;
  failureCount: number;
};

export const useImportJobProgress = () => {
  const apolloClient = useApolloClient();
  const { upsertJob } = useBackgroundJob();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const activeObjectNameRef = useRef<string>('records');
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const handleJobUpdate = useCallback(
    (job: ImportJobData) => {
      const isTerminal =
        job.status === 'completed' ||
        job.status === 'failed' ||
        job.status === 'cancelled';

      upsertJob({
        id: job.id,
        label: `Importing ${activeObjectNameRef.current} records`,
        status: job.status,
        totalItems: job.totalRecords,
        processedItems: job.processedRecords,
        successCount: job.successCount,
        warningCount: job.warningCount,
        failureCount: job.failureCount,
      });

      if (isTerminal) {
        stopPolling();
        setActiveJobId(null);

        try {
          localStorage.removeItem(IMPORT_JOB_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
    },
    [upsertJob, stopPolling],
  );

  useEffect(() => {
    if (!activeJobId) return;

    const poll = async () => {
      try {
        const { data } = await apolloClient.query({
          query: GET_IMPORT_JOB,
          variables: { importJobId: activeJobId },
          fetchPolicy: 'network-only',
        });

        const job = (data as Record<string, any>)?.importJob;

        if (job) {
          handleJobUpdate(job as ImportJobData);
        }
      } catch {
        // Polling failure — will retry next interval
      }
    };

    poll();
    pollTimerRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      stopPolling();
    };
  }, [activeJobId, apolloClient, handleJobUpdate, stopPolling]);

  const startTracking = useCallback(
    ({
      importJobId,
      objectNameSingular,
      totalRecords,
    }: {
      importJobId: string;
      objectNameSingular: string;
      totalRecords: number;
    }) => {
      activeObjectNameRef.current = objectNameSingular;

      try {
        localStorage.setItem(
          IMPORT_JOB_STORAGE_KEY,
          JSON.stringify({ importJobId, objectNameSingular, totalRecords }),
        );
      } catch {
        // ignore
      }

      upsertJob({
        id: importJobId,
        label: `Importing ${objectNameSingular} records`,
        status: 'pending',
        totalItems: totalRecords,
        processedItems: 0,
        successCount: 0,
        warningCount: 0,
        failureCount: 0,
      });

      setActiveJobId(importJobId);
    },
    [upsertJob],
  );

  return { startTracking };
};

export const useImportJobRecovery = () => {
  const { startTracking } = useImportJobProgress();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(IMPORT_JOB_STORAGE_KEY);

      if (!raw) return;

      const stored = JSON.parse(raw) as {
        importJobId: string;
        objectNameSingular: string;
        totalRecords: number;
      };

      startTracking(stored);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
