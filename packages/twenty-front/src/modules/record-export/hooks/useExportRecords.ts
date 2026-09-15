import { t } from '@lingui/core/macro';
import { print } from 'graphql';
import { createClient } from 'graphql-sse';
import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  ExportRecordsDocument,
  RecordExportStatus,
  type CreateRecordExportInput,
  type ExportRecordsSubscription,
} from '~/generated-metadata/graphql';

export const useExportRecords = ({
  onProgress,
}: {
  onProgress?: (progress: number) => void;
}) => {
  // oxlint-disable-next-line twenty/no-state-useref -- owns the live connection cleanup, not rendered state.
  const cancelRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    const cancel = () => cancelRef.current?.();
    window.addEventListener('pagehide', cancel);
    return () => {
      window.removeEventListener('pagehide', cancel);
      cancel();
    };
  }, []);

  const exportRecords = (input: CreateRecordExportInput): Promise<void> => {
    cancelRef.current?.();
    onProgress?.(0);
    const client = createClient({
      url: `${REACT_APP_SERVER_BASE_URL}/metadata`,
      credentials: 'include',
      retryAttempts: 0,
    });

    return new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        client.dispose();
        cancelRef.current = undefined;
        if (isDefined(error)) reject(error);
        else resolve();
      };
      cancelRef.current = () => finish();
      client.subscribe<ExportRecordsSubscription>(
        { query: print(ExportRecordsDocument), variables: { input } },
        {
          next: ({ data, errors }) => {
            if (settled) return;
            if (isDefined(errors) && errors.length > 0) {
              finish(new Error(errors[0].message));
              return;
            }
            const recordExport = data?.exportRecords;
            if (!isDefined(recordExport)) return;
            if (recordExport.status === RecordExportStatus.FAILED) {
              finish(
                new Error(
                  recordExport.errorMessage ??
                    t`The export failed. Please try again.`,
                ),
              );
              return;
            }
            if (recordExport.status === RecordExportStatus.COMPLETED) {
              if (!isDefined(recordExport.downloadUrl)) {
                finish(
                  new Error(
                    t`The export could not be downloaded. Please try again.`,
                  ),
                );
                return;
              }
              onProgress?.(100);
              const link = document.createElement('a');
              link.href = recordExport.downloadUrl;
              link.download = recordExport.filename;
              document.body.appendChild(link);
              link.click();
              link.remove();
              finish();
              return;
            }
            const total = recordExport.totalRecordCount;
            onProgress?.(
              isDefined(total) && total > 0
                ? Math.min(
                    99,
                    Math.round(
                      (recordExport.processedRecordCount / total) * 100,
                    ),
                  )
                : 0,
            );
          },
          error: () =>
            finish(
              new Error(t`The export connection was lost. Please try again.`),
            ),
          complete: () =>
            finish(new Error(t`The export was interrupted. Please try again.`)),
        },
      );
    });
  };

  return { exportRecords };
};
