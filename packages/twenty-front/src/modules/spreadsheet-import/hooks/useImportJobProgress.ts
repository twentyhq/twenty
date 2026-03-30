import { useApolloClient } from '@apollo/client/react';
import { useCallback, useEffect, useRef } from 'react';

import { GET_IMPORT_JOB } from '@/spreadsheet-import/graphql/queries/importJob';
import {
  activeImportJobState,
  type ActiveImportJob,
} from '@/spreadsheet-import/states/activeImportJobState';
import { useBackgroundJob } from '@/ui/feedback/background-job-indicator/hooks/useBackgroundJob';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const IMPORT_JOB_STORAGE_KEY = 'activeImportJobId';
const POLL_INTERVAL_MS = 3000;

const IMPORT_JOB_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
] as const;

type ImportJobStatus = (typeof IMPORT_JOB_STATUSES)[number];

function toImportJobStatus(raw: string): ImportJobStatus {
  const lower = raw.toLowerCase();

  if (IMPORT_JOB_STATUSES.includes(lower as ImportJobStatus)) {
    return lower as ImportJobStatus;
  }

  return 'pending';
}

type ImportJobData = {
  id: string;
  status: string;
  processedRecords: number;
  totalRecords: number;
  successCount: number;
  warningCount: number;
  failureCount: number;
};

type ImportJobQueryResponse = {
  importJob?: ImportJobData;
};

function isImportJobResponse(
  data: unknown,
): data is ImportJobQueryResponse {
  if (!data || typeof data !== 'object') return false;

  if (!('importJob' in data)) return false;

  const job = (data as ImportJobQueryResponse).importJob;

  if (!job || typeof job !== 'object') return false;

  return (
    'id' in job &&
    typeof job.id === 'string' &&
    'status' in job &&
    typeof job.status === 'string' &&
    'processedRecords' in job &&
    typeof job.processedRecords === 'number' &&
    'totalRecords' in job &&
    typeof job.totalRecords === 'number'
  );
}

type StoredImportJob = {
  importJobId: string;
  objectNameSingular: string;
  totalRecords: number;
};

function isStoredImportJob(value: unknown): value is StoredImportJob {
  if (!value || typeof value !== 'object') return false;

  return (
    'importJobId' in value &&
    typeof value.importJobId === 'string' &&
    'objectNameSingular' in value &&
    typeof value.objectNameSingular === 'string' &&
    'totalRecords' in value &&
    typeof value.totalRecords === 'number'
  );
}

/**
 * Hook to start tracking an import job.
 * Sets the global atom + localStorage so the always-mounted poller picks it up.
 */
export const useImportJobProgress = () => {
  const setActiveJob = useSetAtomState(activeImportJobState);
  const { upsertJob } = useBackgroundJob();

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

      setActiveJob({ importJobId, objectNameSingular, totalRecords });
    },
    [upsertJob, setActiveJob],
  );

  return { startTracking };
};

/**
 * Poller effect — must be mounted in a permanently-rendered component
 * (e.g. AppRouterProviders). Watches the global activeImportJobState atom
 * and polls the server for progress updates.
 */
export const useImportJobPoller = () => {
  const apolloClient = useApolloClient();
  const activeJob = useAtomStateValue(activeImportJobState);
  const setActiveJob = useSetAtomState(activeImportJobState);
  const { upsertJob } = useBackgroundJob();
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeJobRef = useRef<ActiveImportJob>(null);

  // Keep a ref in sync so the interval callback always sees the latest value
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
          query: GET_IMPORT_JOB,
          variables: { importJobId: current.importJobId },
          fetchPolicy: 'network-only',
        });

        if (!isImportJobResponse(data)) return;

        const job = data.importJob;

        if (!job) return;

        const normalizedStatus = toImportJobStatus(job.status);
        const isTerminal =
          normalizedStatus === 'completed' ||
          normalizedStatus === 'failed' ||
          normalizedStatus === 'cancelled';

        upsertJob({
          id: job.id,
          label: `Importing ${current.objectNameSingular} records`,
          status: normalizedStatus,
          totalItems: job.totalRecords,
          processedItems: job.processedRecords,
          successCount: job.successCount,
          warningCount: job.warningCount,
          failureCount: job.failureCount,
        });

        if (isTerminal) {
          stopPolling();
          setActiveJob(null);

          try {
            localStorage.removeItem(IMPORT_JOB_STORAGE_KEY);
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
  }, [activeJob?.importJobId]);

  return null;
};

/**
 * Recovery effect — runs once on mount to check localStorage for an
 * in-progress import from a previous session.
 */
export const useImportJobRecovery = () => {
  const setActiveJob = useSetAtomState(activeImportJobState);
  const { upsertJob } = useBackgroundJob();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(IMPORT_JOB_STORAGE_KEY);

      if (!raw) return;

      const parsed: unknown = JSON.parse(raw);

      if (!isStoredImportJob(parsed)) return;

      const stored = parsed;

      // Seed the background job indicator immediately
      upsertJob({
        id: stored.importJobId,
        label: `Importing ${stored.objectNameSingular} records`,
        status: 'processing',
        totalItems: stored.totalRecords,
        processedItems: 0,
        successCount: 0,
        warningCount: 0,
        failureCount: 0,
      });

      // Set the global atom — the poller effect will pick it up
      setActiveJob(stored);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
