import { getRecordExportUpdate } from '@/record-export/utils/getRecordExportUpdate';
import { t } from '@lingui/core/macro';
import { print } from 'graphql';
import { createClient } from 'graphql-sse';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  ExportRecordsDocument,
  type CreateRecordExportInput,
  type ExportRecordsSubscription,
} from '~/generated-metadata/graphql';

export const createRecordExportConnection = () => {
  let cancel: (() => void) | undefined;

  const exportRecords = ({
    input,
    onProgress,
  }: {
    input: CreateRecordExportInput;
    onProgress?: (progress: number) => void;
  }): Promise<void> => {
    cancel?.();
    onProgress?.(0);
    const client = createClient({
      url: `${REACT_APP_SERVER_BASE_URL}/metadata`,
      credentials: 'include',
      retryAttempts: 0,
    });

    return new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: Error) => {
        if (settled) {
          return;
        }
        settled = true;
        client.dispose();
        cancel = undefined;
        if (isDefined(error)) {
          reject(error);
        } else {
          resolve();
        }
      };
      cancel = () => finish();
      client.subscribe<ExportRecordsSubscription>(
        { query: print(ExportRecordsDocument), variables: { input } },
        {
          next: ({ data, errors }) => {
            if (settled) {
              return;
            }
            if (isDefined(errors) && errors.length > 0) {
              finish(new Error(errors[0].message));
              return;
            }
            const recordExport = data?.exportRecords;
            if (!isDefined(recordExport)) {
              return;
            }
            try {
              const update = getRecordExportUpdate(recordExport);
              onProgress?.(update.progress);
              if (isDefined(update.download)) {
                const link = document.createElement('a');
                link.href = update.download.url;
                link.download = update.download.filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
                finish();
              }
            } catch (error) {
              finish(error instanceof Error ? error : new Error(String(error)));
            }
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

  return { exportRecords, cancel: () => cancel?.() };
};
