import { useApolloClient } from '@apollo/client/react';
import { useCallback, useEffect, useRef } from 'react';

import { GET_EXPORT_JOB } from '@/object-record/record-index/export/graphql/queries/exportJob';
import { CANCEL_EXPORT_JOB } from '@/object-record/record-index/export/graphql/mutations/cancelExportJob';
import {
  activeExportJobState,
  type ActiveExportJob,
} from '@/object-record/record-index/export/states/activeExportJobState';
import { useBackgroundJob } from '@/ui/feedback/background-job-indicator/hooks/useBackgroundJob';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const EXPORT_JOB_STORAGE_KEY = 'activeExportJobId';
const POLL_INTERVAL_MS = 3000;

const EXPORT_JOB_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
] as const;

type ExportJobStatus = (typeof EXPORT_JOB_STATUSES)[number];

function toExportJobStatus(raw: string): ExportJobStatus {
  const lower = raw.toLowerCase();

  if (EXPORT_JOB_STATUSES.includes(lower as ExportJobStatus)) {
    return lower as ExportJobStatus;
  }

  return 'pending';
}

type ExportJobData = {
  id: string;
  status: string;
  processedRecords: number;
  totalRecords: number;
  result: Record<string, unknown> | null;
};

type ExportJobQueryResponse = {
  exportJob?: ExportJobData;
};

function isExportJobResponse(
  data: unknown,
): data is ExportJobQueryResponse {
  if (!data || typeof data !== 'object') return false;

  if (!('exportJob' in data)) return false;

  const job = (data as ExportJobQueryResponse).exportJob;

  if (!job || typeof job !== 'object') return false;

  return (
    'id' in job &&
    typeof job.id === 'string' &&
    'status' in job &&
    typeof job.status === 'string'
  );
}

type StoredExportJob = {
  exportJobId: string;
  objectNameSingular: string;
  objectNamePlural: string;
};

function isStoredExportJob(value: unknown): value is StoredExportJob {
  if (!value || typeof value !== 'object') return false;

  return (
    'exportJobId' in value &&
    typeof value.exportJobId === 'string' &&
    'objectNameSingular' in value &&
    typeof value.objectNameSingular === 'string'
  );
}

/**
 * Hook to start tracking an export job.
 * Sets the global atom + localStorage so the always-mounted poller picks it up.
 */
export const useExportJobProgress = () => {
  const setActiveJob = useSetAtomState(activeExportJobState);
  const { upsertJob } = useBackgroundJob();

  const startTracking = useCallback(
    ({
      exportJobId,
      objectNameSingular,
      objectNamePlural,
    }: {
      exportJobId: string;
      objectNameSingular: string;
      objectNamePlural: string;
    }) => {
      try {
        localStorage.setItem(
          EXPORT_JOB_STORAGE_KEY,
          JSON.stringify({ exportJobId, objectNameSingular, objectNamePlural }),
        );
      } catch {
        // ignore
      }

      upsertJob({
        id: exportJobId,
        label: `Exporting ${objectNameSingular} records`,
        status: 'pending',
        totalItems: 0,
        processedItems: 0,
        successCount: 0,
        warningCount: 0,
        failureCount: 0,
      });

      setActiveJob({ exportJobId, objectNameSingular, objectNamePlural });
    },
    [upsertJob, setActiveJob],
  );

  return { startTracking };
};

/**
 * Poller effect — must be mounted in a permanently-rendered component.
 * Watches the global activeExportJobState atom and polls the server.
 */
export const useExportJobPoller = () => {
  const apolloClient = useApolloClient();
  const activeJob = useAtomStateValue(activeExportJobState);
  const setActiveJob = useSetAtomState(activeExportJobState);
  const { upsertJob } = useBackgroundJob();
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeJobRef = useRef<ActiveExportJob>(null);

  activeJobRef.current = activeJob;

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!activeJob) {
      stopPolling();

      return;
    }

    const poll = async () => {
      const current = activeJobRef.current;

      if (!current) return;

      try {
        const { data } = await apolloClient.query({
          query: GET_EXPORT_JOB,
          variables: { exportJobId: current.exportJobId },
          fetchPolicy: 'network-only',
        });

        if (!isExportJobResponse(data)) return;

        const job = data.exportJob;

        if (!job) return;

        const normalizedStatus = toExportJobStatus(job.status);
        const isTerminal =
          normalizedStatus === 'completed' ||
          normalizedStatus === 'failed' ||
          normalizedStatus === 'cancelled';

        const downloadUrl =
          normalizedStatus === 'completed'
            ? (job.result?.downloadUrl as string | undefined)
            : undefined;

        upsertJob({
          id: job.id,
          label: `Exporting ${current.objectNameSingular} records`,
          status: normalizedStatus,
          totalItems: job.totalRecords,
          processedItems: job.processedRecords,
          successCount: job.processedRecords,
          warningCount: 0,
          failureCount: 0,
          downloadUrl,
        });

        if (isTerminal) {
          stopPolling();
          setActiveJob(null);

          // Auto-download on completion via fetch + blob
          if (normalizedStatus === 'completed' && downloadUrl) {
            try {
              const response = await fetch(downloadUrl);
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');

              a.href = blobUrl;
              a.download = `${current.objectNamePlural}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(blobUrl);
            } catch {
              // Fallback: open in new tab
              window.open(downloadUrl, '_blank');
            }
          }

          try {
            localStorage.removeItem(EXPORT_JOB_STORAGE_KEY);
          } catch {
            // ignore
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJob?.exportJobId]);

  return null;
};

/**
 * Recovery effect — runs once on mount to check localStorage for an
 * in-progress export from a previous session.
 */
export const useExportJobRecovery = () => {
  const setActiveJob = useSetAtomState(activeExportJobState);
  const { upsertJob } = useBackgroundJob();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EXPORT_JOB_STORAGE_KEY);

      if (!raw) return;

      const parsed: unknown = JSON.parse(raw);

      if (!isStoredExportJob(parsed)) return;

      const stored = parsed;

      upsertJob({
        id: stored.exportJobId,
        label: `Exporting ${stored.objectNameSingular} records`,
        status: 'processing',
        totalItems: 0,
        processedItems: 0,
        successCount: 0,
        warningCount: 0,
        failureCount: 0,
      });

      setActiveJob(stored);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

/**
 * Hook to cancel an export job.
 */
export const useCancelExportJob = () => {
  const apolloClient = useApolloClient();

  const cancelExportJob = useCallback(
    async (exportJobId: string) => {
      await apolloClient.mutate({
        mutation: CANCEL_EXPORT_JOB,
        variables: { exportJobId },
      });
    },
    [apolloClient],
  );

  return { cancelExportJob };
};
