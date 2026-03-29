import { useMutation } from '@apollo/client/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CANCEL_IMPORT_JOB } from '@/spreadsheet-import/graphql/mutations/cancelImportJob';
import { GET_IMPORT_JOB } from '@/spreadsheet-import/graphql/queries/importJob';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
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
  result: Record<string, unknown> | null;
};

export const useImportJobProgress = () => {
  const {
    enqueueSuccessSnackBar,
    enqueueErrorSnackBar,
    enqueueInfoSnackBar,
  } = useSnackBar();

  const apolloClient = useApolloCoreClient();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cancelImportJobMutation] = useMutation(CANCEL_IMPORT_JOB);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const handleJobUpdate = useCallback(
    (job: ImportJobData) => {
      const dedupeKey = `import-${job.id}`;

      if (job.status === 'processing' || job.status === 'pending') {
        enqueueInfoSnackBar({
          message: t`Importing records... (${job.processedRecords} / ${job.totalRecords})`,
          options: {
            duration: undefined,
            dedupeKey,
            onCancel: () => {
              cancelImportJobMutation({
                variables: { importJobId: job.id },
              });
            },
          },
        });

        return;
      }

      // Job finished — stop polling and clear state
      stopPolling();
      setActiveJobId(null);

      try {
        localStorage.removeItem(IMPORT_JOB_STORAGE_KEY);
      } catch {
        // ignore
      }

      if (job.status === 'completed') {
        const hasIssues = job.warningCount > 0 || job.failureCount > 0;

        enqueueSuccessSnackBar({
          message: hasIssues
            ? t`Import complete: ${job.successCount} succeeded, ${job.warningCount} warnings, ${job.failureCount} failed`
            : t`${job.successCount} records imported successfully`,
          options: {
            dedupeKey,
            duration: hasIssues ? 10000 : 6000,
          },
        });
      } else if (job.status === 'cancelled') {
        enqueueInfoSnackBar({
          message: t`Import cancelled: ${job.processedRecords} of ${job.totalRecords} records processed`,
          options: { dedupeKey },
        });
      } else if (job.status === 'failed') {
        enqueueErrorSnackBar({
          message: t`Import failed after processing ${job.processedRecords} records`,
          options: { dedupeKey },
        });
      }
    },
    [
      cancelImportJobMutation,
      enqueueInfoSnackBar,
      enqueueSuccessSnackBar,
      enqueueErrorSnackBar,
      stopPolling,
    ],
  );

  // Poll for progress when there's an active job
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

    // Initial poll immediately
    poll();

    // Then poll at interval
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
      // Persist for recovery after page refresh
      try {
        localStorage.setItem(
          IMPORT_JOB_STORAGE_KEY,
          JSON.stringify({ importJobId, objectNameSingular, totalRecords }),
        );
      } catch {
        // localStorage might not be available
      }

      // Show initial snackbar
      enqueueInfoSnackBar({
        message: t`Importing ${objectNameSingular} records... (0 / ${totalRecords})`,
        options: {
          duration: undefined,
          dedupeKey: `import-${importJobId}`,
          onCancel: () => {
            cancelImportJobMutation({
              variables: { importJobId },
            });
          },
        },
      });

      // Start polling
      setActiveJobId(importJobId);
    },
    [cancelImportJobMutation, enqueueInfoSnackBar],
  );

  return { startTracking };
};

/**
 * Recovery hook — checks localStorage on mount for an in-progress import
 * job and reconnects polling if found. Mount this near the app root.
 */
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

      // Reconnect tracking — polling will pick up current status
      startTracking(stored);
    } catch {
      // Invalid localStorage data — ignore
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
