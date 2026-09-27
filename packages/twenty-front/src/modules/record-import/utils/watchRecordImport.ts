import { t } from '@lingui/core/macro';
import { print } from 'graphql';
import { createClient } from 'graphql-sse';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  RecordImportProgressDocument,
  type RecordImportFieldsFragment,
  type RecordImportProgressSubscription,
} from '~/generated-metadata/graphql';

// Follows a session until `isSettled` accepts an update. Disposing only stops
// listening: the server keeps working on the import.
export const watchRecordImport = ({
  id,
  onUpdate,
  isSettled,
}: {
  id: string;
  onUpdate?: (recordImport: RecordImportFieldsFragment) => void;
  isSettled: (recordImport: RecordImportFieldsFragment) => boolean;
}) => {
  const client = createClient({
    url: `${REACT_APP_SERVER_BASE_URL.replace(/\/$/, '')}/metadata`,
    credentials: 'include',
    retryAttempts: 3,
  });
  let dispose = () => client.dispose();

  const promise = new Promise<RecordImportFieldsFragment>((resolve, reject) => {
    let isDone = false;
    const finish = (
      result: { recordImport: RecordImportFieldsFragment } | { error: Error },
    ) => {
      if (isDone) {
        return;
      }
      isDone = true;
      client.dispose();
      if ('error' in result) {
        reject(result.error);
      } else {
        resolve(result.recordImport);
      }
    };

    dispose = () =>
      finish({ error: new Error(t`Stopped following the import.`) });

    client.subscribe<RecordImportProgressSubscription>(
      {
        query: print(RecordImportProgressDocument),
        variables: { input: { id } },
      },
      {
        next: ({ data, errors }) => {
          if (isDefined(errors) && errors.length > 0) {
            finish({ error: new Error(errors[0].message) });
            return;
          }
          const recordImport = data?.recordImportProgress;
          if (!isDefined(recordImport)) {
            return;
          }
          onUpdate?.(recordImport);
          if (isSettled(recordImport)) {
            finish({ recordImport });
          }
        },
        error: () =>
          finish({
            error: new Error(
              t`The connection to the import was lost. The import keeps running on the server.`,
            ),
          }),
        complete: () =>
          finish({
            error: new Error(t`The import stopped reporting progress.`),
          }),
      },
    );
  });

  return { promise, dispose: () => dispose() };
};
