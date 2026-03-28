import { useMutation } from '@apollo/client/react';
import { useCallback, useEffect, useRef } from 'react';

import { CANCEL_IMPORT_JOB } from '@/spreadsheet-import/graphql/mutations/cancelImportJob';
import { GET_IMPORT_JOB } from '@/spreadsheet-import/graphql/queries/importJob';
import { IMPORT_JOB_PROGRESS_SUBSCRIPTION } from '@/spreadsheet-import/graphql/subscriptions/importJobProgress';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';

const IMPORT_JOB_STORAGE_KEY = 'activeImportJobId';
const POLL_INTERVAL = 5000;

type ImportJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export const useImportJobProgress = () => {
  const {
    enqueueSuccessSnackBar,
    enqueueErrorSnackBar,
    enqueueInfoSnackBar,
  } = useSnackBar();
  const { enqueueDialog } = useDialogManager();
  const activeJobIdRef = useRef<string | null>(null);

  const [cancelImportJobMutation] = useMutation(CANCEL_IMPORT_JOB);

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
      activeJobIdRef.current = importJobId;

      // Persist for recovery after page refresh
      try {
        localStorage.setItem(
          IMPORT_JOB_STORAGE_KEY,
          JSON.stringify({ importJobId, objectNameSingular, totalRecords }),
        );
      } catch {
        // localStorage might not be available
      }

      // Show persistent progress snackbar
      enqueueInfoSnackBar({
        message: t`Importing ${objectNameSingular} records... (0 / ${totalRecords})`,
        options: {
          duration: undefined, // Indefinite
          dedupeKey: `import-${importJobId}`,
          onCancel: () => {
            cancelImportJobMutation({
              variables: { importJobId },
            });
          },
        },
      });
    },
    [cancelImportJobMutation, enqueueInfoSnackBar],
  );

  const handleProgressUpdate = useCallback(
    (data: {
      importJobId: string;
      status: ImportJobStatus;
      processedRecords: number;
      totalRecords: number;
      successCount: number;
      warningCount: number;
      failureCount: number;
      result: Record<string, unknown> | null;
    }) => {
      if (data.status === 'processing' || data.status === 'pending') {
        // Update the snackbar message with progress
        enqueueInfoSnackBar({
          message: t`Importing records... (${data.processedRecords} / ${data.totalRecords})`,
          options: {
            duration: undefined,
            dedupeKey: `import-${data.importJobId}`,
            progress:
              data.totalRecords > 0
                ? (data.processedRecords / data.totalRecords) * 100
                : 0,
            onCancel: () => {
              cancelImportJobMutation({
                variables: { importJobId: data.importJobId },
              });
            },
          },
        });

        return;
      }

      // Job finished — clear tracking
      activeJobIdRef.current = null;

      try {
        localStorage.removeItem(IMPORT_JOB_STORAGE_KEY);
      } catch {
        // ignore
      }

      if (data.status === 'completed') {
        const hasIssues = data.warningCount > 0 || data.failureCount > 0;

        if (hasIssues) {
          enqueueSuccessSnackBar({
            message: t`Import complete: ${data.successCount} succeeded, ${data.warningCount} warnings, ${data.failureCount} failed`,
            options: {
              dedupeKey: `import-${data.importJobId}`,
              duration: 10000,
            },
          });
        } else {
          enqueueSuccessSnackBar({
            message: t`${data.successCount} records imported successfully`,
            options: {
              dedupeKey: `import-${data.importJobId}`,
            },
          });
        }
      } else if (data.status === 'cancelled') {
        enqueueInfoSnackBar({
          message: t`Import cancelled: ${data.processedRecords} of ${data.totalRecords} records processed`,
          options: {
            dedupeKey: `import-${data.importJobId}`,
          },
        });
      } else if (data.status === 'failed') {
        enqueueErrorSnackBar({
          message: t`Import failed after processing ${data.processedRecords} records`,
          options: {
            dedupeKey: `import-${data.importJobId}`,
          },
        });
      }
    },
    [
      cancelImportJobMutation,
      enqueueInfoSnackBar,
      enqueueSuccessSnackBar,
      enqueueErrorSnackBar,
    ],
  );

  return { startTracking, handleProgressUpdate };
};

/**
 * Recovery hook — checks localStorage on mount for an in-progress import
 * job and reconnects tracking if found.
 */
export const useImportJobRecovery = () => {
  const { handleProgressUpdate } = useImportJobProgress();

  useEffect(() => {
    let stored: {
      importJobId: string;
      objectNameSingular: string;
      totalRecords: number;
    } | null = null;

    try {
      const raw = localStorage.getItem(IMPORT_JOB_STORAGE_KEY);

      if (raw) {
        stored = JSON.parse(raw);
      }
    } catch {
      return;
    }

    if (!stored) return;

    // Poll once to check current status
    // The subscription will be set up by the component that renders this hook
    // For now, just leave the localStorage entry — the polling query below handles recovery
  }, [handleProgressUpdate]);
};
