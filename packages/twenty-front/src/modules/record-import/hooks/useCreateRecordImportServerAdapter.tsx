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
import { type SpreadsheetImportServerAdapter } from '@/spreadsheet-import/types/SpreadsheetImportServerAdapter';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import {
  CancelRecordImportDocument,
  CreateRecordImportDocument,
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

      const getSession = () => {
        if (!isDefined(session)) {
          throw new Error(t`Upload a file first.`);
        }
        return session;
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

          const validated = await watchRecordImport({
            id: getSession().id,
            isSettled: (recordImport) => recordImport.status !== 'VALIDATING',
          }).promise;
          session = validated;

          if (validated.status !== 'VALIDATED') {
            throw new Error(
              validated.errorMessage ?? t`The rows could not be checked.`,
            );
          }

          return {
            rowCount: validated.rowCount ?? 0,
            errorRowCount: validated.errorRowCount ?? 0,
          };
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
