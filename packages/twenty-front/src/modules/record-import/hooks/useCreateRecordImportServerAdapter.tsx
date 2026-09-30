import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { parseRecordImportRows } from '@/record-import/utils/parseRecordImportRows';
import { buildRecordImportMatchColumnsData } from '@/record-import/utils/buildRecordImportMatchColumnsData';
import { watchRecordImport } from '@/record-import/utils/watchRecordImport';
import { spreadsheetImportCreatedRecordsProgressState } from '@/spreadsheet-import/states/spreadsheetImportCreatedRecordsProgressState';
import {
  type SpreadsheetImportServerAdapter,
  type SpreadsheetImportServerRowEdit,
} from '@/spreadsheet-import/types/SpreadsheetImportServerAdapter';
import { RECORD_IMPORT_MAX_EDITS_PER_REQUEST } from '@/record-import/constants/RecordImportMaxEditsPerRequest';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import {
  CancelRecordImportDocument,
  CreateRecordImportDocument,
  EditRecordImportRowsDocument,
  FileFolder,
  PrepareRecordImportDocument,
  RecordImportColumnSamplesDocument,
  type RecordImportFieldsFragment,
  RecordImportPreviewDocument,
  RecordImportReportUrlDocument,
  RecordImportRowsDocument,
  SetRecordImportMappingDocument,
  StartRecordImportDocument,
} from '~/generated-metadata/graphql';

const RUNNING_STATUSES = ['PREPARING', 'IMPORTING', 'CANCELLING'];

const isRejectedEditsError = (error: unknown): error is CombinedGraphQLErrors =>
  CombinedGraphQLErrors.is(error) &&
  error.errors.some(
    (graphQLError) => graphQLError.extensions?.code === 'BAD_USER_INPUT',
  );

export const useCreateRecordImportServerAdapter = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) => {
  const apolloClient = useApolloClient();
  const apolloCoreClient = useApolloCoreClient();
  const { createFileUploadAndPutFile } = useDirectFileUpload();
  const { refetchAggregateQueries } = useRefetchAggregateQueries();
  const { enqueueToast } = useToast();
  const { formatNumber } = useNumberFormat();
  const setSpreadsheetImportCreatedRecordsProgress = useSetAtomState(
    spreadsheetImportCreatedRecordsProgressState,
  );

  const createRecordImportServerAdapter =
    (): SpreadsheetImportServerAdapter => {
      let session: RecordImportFieldsFragment | undefined;
      let stopWatchingImport: (() => void) | undefined;
      // Edits the server has not confirmed yet, merged by row, and the chain
      // that sends them one request at a time without waiting for validation
      const unsavedEdits = new Map<number, SpreadsheetImportServerRowEdit>();
      let editsQueue: Promise<unknown> = Promise.resolve();

      const getSession = () => {
        if (!isDefined(session)) {
          throw new Error(t`Upload a file first.`);
        }
        return session;
      };

      const waitForValidation = async () => {
        const validated = await watchRecordImport({
          id: getSession().id,
          isSettled: (recordImport) => recordImport.status !== 'VALIDATING',
        }).promise;

        // An edit saved while watching already moved the session further
        if (validated.version >= getSession().version) {
          session = validated;
        }

        if (validated.status !== 'VALIDATED') {
          throw new Error(
            validated.errorMessage ?? t`The rows could not be checked.`,
          );
        }

        return {
          rowCount: (validated.rowCount ?? 0) - validated.deletedRowCount,
          errorRowCount: validated.errorRowCount ?? 0,
        };
      };

      const refreshRecords = async () => {
        await apolloCoreClient.refetchQueries({
          updateCache: (cache) => {
            cache.evict({ fieldName: objectMetadataItem.namePlural });
          },
        });
        await refetchAggregateQueries({
          objectMetadataNamePlural: objectMetadataItem.namePlural,
        });
        dispatchObjectRecordOperationBrowserEvent({
          objectMetadataItem,
          operation: { type: 'create-many' },
        });
      };

      const openReport = async (id: string) => {
        const { data } = await apolloClient.query({
          query: RecordImportReportUrlDocument,
          variables: { input: { id } },
          fetchPolicy: 'network-only',
        });
        if (isDefined(data?.recordImportReportUrl)) {
          window.open(data.recordImportReportUrl, '_blank', 'noopener');
        }
      };

      const notifyResult = (recordImport: RecordImportFieldsFragment) => {
        const importedCount = formatNumber(recordImport.importedRecordCount);
        const skippedCount = formatNumber(
          recordImport.skippedRowCount + recordImport.failedRowCount,
        );
        const hasProblems =
          recordImport.skippedRowCount + recordImport.failedRowCount > 0;

        enqueueToast({
          variant:
            recordImport.status === 'COMPLETED'
              ? hasProblems
                ? 'warning'
                : 'success'
              : 'error',
          children:
            recordImport.status === 'CANCELLED'
              ? t`Import stopped. ${importedCount} records imported.`
              : recordImport.status === 'FAILED'
                ? (recordImport.errorMessage ?? t`The import failed.`)
                : t`Import finished. ${importedCount} records imported.`,
          description: hasProblems
            ? t`${skippedCount} rows were not imported.`
            : undefined,
          action: recordImport.hasReport ? (
            <Button
              title={t`Download report`}
              size="sm"
              variant="outline"
              onClick={() => openReport(recordImport.id)}
            />
          ) : undefined,
          duration: hasProblems ? 15_000 : 5_000,
        });
      };

      const followImport = (id: string) => {
        const { promise, dispose } = watchRecordImport({
          id,
          onUpdate: (recordImport) => {
            session = recordImport;
            setSpreadsheetImportCreatedRecordsProgress(
              recordImport.importedRecordCount + recordImport.failedRowCount,
            );
          },
          isSettled: (recordImport) =>
            !RUNNING_STATUSES.includes(recordImport.status),
        });

        stopWatchingImport = dispose;

        return promise.then(async (recordImport) => {
          await refreshRecords();
          notifyResult(recordImport);

          return recordImport;
        });
      };

      return {
        uploadFile: async (file) => {
          const { fileId } = await createFileUploadAndPutFile(file, {
            fileFolder: FileFolder.RecordImport,
          });
          const { data } = await apolloClient.mutate({
            mutation: CreateRecordImportDocument,
            variables: {
              input: {
                fileId,
                fileName: file.name,
                objectMetadataId: objectMetadataItem.id,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
            },
          });
          const created = data?.createRecordImport;
          if (!isDefined(created)) {
            throw new Error(t`The file could not be uploaded.`);
          }
          session = created.recordImport;

          return { sheetNames: session.sheetNames, rows: created.rows };
        },

        previewSheet: async (sheetName) => {
          const { data } = await apolloClient.query({
            query: RecordImportPreviewDocument,
            variables: { input: { id: getSession().id, sheetName } },
            fetchPolicy: 'network-only',
          });
          return data?.recordImportPreview.rows ?? [];
        },

        prepareRows: async ({ sheetName, headerRowIndex }) => {
          const { data } = await apolloClient.mutate({
            mutation: PrepareRecordImportDocument,
            variables: {
              input: {
                id: getSession().id,
                version: getSession().version,
                sheetName,
                headerRowIndex,
              },
            },
          });
          session = data?.prepareRecordImport ?? session;
          unsavedEdits.clear();

          const prepared = await watchRecordImport({
            id: getSession().id,
            isSettled: (recordImport) => recordImport.status !== 'PREPARING',
          }).promise;
          session = prepared;

          if (prepared.status !== 'READY') {
            throw new Error(
              prepared.errorMessage ?? t`The file could not be read.`,
            );
          }

          const { data: samplesData } = await apolloClient.query({
            query: RecordImportColumnSamplesDocument,
            variables: { input: { id: prepared.id } },
            fetchPolicy: 'network-only',
          });
          const samples = samplesData?.recordImportColumnSamples;
          if (!isDefined(samples)) {
            throw new Error(t`The file could not be read.`);
          }

          return {
            headerValues: samples.headerValues,
            data: buildRecordImportMatchColumnsData(samples),
            rowCount: prepared.rowCount ?? 0,
          };
        },

        validateRows: async (columns) => {
          const { data } = await apolloClient.mutate({
            mutation: SetRecordImportMappingDocument,
            variables: {
              input: {
                id: getSession().id,
                version: getSession().version,
                columns,
              },
            },
          });
          session = data?.setRecordImportMapping ?? session;
          unsavedEdits.clear();

          return waitForValidation();
        },

        loadRows: async ({ offset, limit, onlyErrors }) => {
          const { data } = await apolloClient.query({
            query: RecordImportRowsDocument,
            variables: {
              input: { id: getSession().id, offset, limit, onlyErrors },
            },
            fetchPolicy: 'network-only',
          });
          const page = data?.recordImportRows;

          return {
            totalCount: page?.totalCount ?? 0,
            rows: parseRecordImportRows(page?.rows),
          };
        },

        saveEdits: async (edits) => {
          for (const edit of edits) {
            const previous = unsavedEdits.get(edit.rowNumber);

            unsavedEdits.set(edit.rowNumber, {
              rowNumber: edit.rowNumber,
              values: { ...previous?.values, ...edit.values },
              isDeleted:
                previous?.isDeleted === true || edit.isDeleted === true,
            });
          }

          const send = editsQueue.then(async () => {
            const batch = [...unsavedEdits.values()];
            let rejectedEditsErrorMessage: string | undefined;

            for (
              let start = 0;
              start < batch.length;
              start += RECORD_IMPORT_MAX_EDITS_PER_REQUEST
            ) {
              const requestEdits = batch.slice(
                start,
                start + RECORD_IMPORT_MAX_EDITS_PER_REQUEST,
              );

              try {
                const { data } = await apolloClient.mutate({
                  mutation: EditRecordImportRowsDocument,
                  variables: {
                    input: {
                      id: getSession().id,
                      version: getSession().version,
                      edits: requestEdits,
                    },
                  },
                });

                session = data?.editRecordImportRows ?? session;
              } catch (error) {
                if (!isRejectedEditsError(error)) {
                  throw error;
                }

                // The server rejects the same edits on every retry, and a
                // later edit of the row still carries the rejected value
                rejectedEditsErrorMessage = error.message;

                for (const edit of requestEdits) {
                  unsavedEdits.delete(edit.rowNumber);
                }

                continue;
              }

              // Keeps edits made while this request was being sent
              for (const edit of requestEdits) {
                if (unsavedEdits.get(edit.rowNumber) === edit) {
                  unsavedEdits.delete(edit.rowNumber);
                }
              }
            }

            return rejectedEditsErrorMessage;
          });

          editsQueue = send.catch(() => undefined);

          const rejectedEditsErrorMessage = await send;

          // Resolves on the validation of the last edit sent, not of this one
          for (;;) {
            const queue = editsQueue;

            await queue;

            const counts = await waitForValidation();

            if (queue === editsQueue) {
              return { ...counts, rejectedEditsErrorMessage };
            }
          }
        },

        getUnsavedEdits: () => [...unsavedEdits.values()],

        importRows: async () => {
          const { data } = await apolloClient.mutate({
            mutation: StartRecordImportDocument,
            variables: {
              input: { id: getSession().id, version: getSession().version },
            },
          });
          session = data?.startRecordImport ?? session;
          setSpreadsheetImportCreatedRecordsProgress(0);

          const recordImport = await followImport(getSession().id);

          if (recordImport.status === 'FAILED') {
            throw new Error(recordImport.errorMessage ?? t`The import failed.`);
          }
        },

        cancelImport: async () => {
          if (!isDefined(session)) {
            return;
          }
          await apolloClient.mutate({
            mutation: CancelRecordImportDocument,
            variables: { input: { id: session.id } },
          });
        },

        close: () => {
          // A running import outlives the dialog; its result still shows up as
          // a toast. Anything else is discarded with its files.
          if (
            isDefined(session) &&
            !RUNNING_STATUSES.includes(session.status) &&
            !isDefined(stopWatchingImport)
          ) {
            const id = session.id;
            session = undefined;
            apolloClient
              .mutate({
                mutation: CancelRecordImportDocument,
                variables: { input: { id } },
              })
              .catch(() => undefined);
          }
        },
      };
    };

  return { createRecordImportServerAdapter };
};
