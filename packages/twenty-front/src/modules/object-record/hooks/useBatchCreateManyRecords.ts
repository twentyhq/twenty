import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import {
  useCreateManyRecords,
  type useCreateManyRecordsProps,
} from '@/object-record/hooks/useCreateManyRecords';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';

export type ImportRecordWarning = {
  entityIndex: number;
  recordId?: string;
  fieldName: string;
  connectFieldName: string;
  targetObjectName: string;
  condition: string;
  reason: 'CONNECT_NOT_FOUND' | 'CONNECT_AMBIGUOUS' | 'CONNECT_CREATE_FAILED';
};

export type BatchCreateResult<T> = {
  records: T[];
  warnings: ImportRecordWarning[];
  failures: Array<{
    batchStartIndex: number;
    error: string;
  }>;
};

const isPartialSuccessError = (
  error: unknown,
): error is CombinedGraphQLErrors => {
  if (!CombinedGraphQLErrors.is(error)) return false;

  const extensions = (error as CombinedGraphQLErrors).errors?.[0]?.extensions;

  return extensions?.subCode === 'IMPORT_PARTIAL_SUCCESS';
};

const extractPartialSuccessData = (error: CombinedGraphQLErrors) => {
  const extensions = error.errors?.[0]?.extensions as Record<string, any>;

  return {
    importWarnings: (extensions?.importWarnings ?? []) as ImportRecordWarning[],
    savedRecordCount: (extensions?.savedRecordCount ?? 0) as number,
  };
};

export const useBatchCreateManyRecords = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  recordGqlFields,
  shouldMatchRootQueryFilter,
  skipPostOptimisticEffect = false,
  mutationBatchSize = DEFAULT_MUTATION_BATCH_SIZE,
  setBatchedRecordsCount,
  abortController,
}: useCreateManyRecordsProps & {
  mutationBatchSize?: number;
  setBatchedRecordsCount?: (count: number) => void;
  abortController?: AbortController;
}) => {
  const { createManyRecords } = useCreateManyRecords({
    objectNameSingular,
    recordGqlFields,
    skipPostOptimisticEffect: skipPostOptimisticEffect,
    shouldMatchRootQueryFilter,
    shouldRefetchAggregateQueries: false,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { refetchAggregateQueries } = useRefetchAggregateQueries();

  const { enqueueWarningSnackBar } = useSnackBar();
  const { formatNumber } = useNumberFormat();

  const batchCreateManyRecords = async ({
    recordsToCreate,
    upsert,
  }: {
    recordsToCreate: Partial<CreatedObjectRecord>[];
    upsert?: boolean;
  }): Promise<BatchCreateResult<CreatedObjectRecord>> => {
    const numberOfBatches = Math.ceil(
      recordsToCreate.length / mutationBatchSize,
    );

    setBatchedRecordsCount?.(0);

    const allCreatedRecords: CreatedObjectRecord[] = [];
    const allWarnings: ImportRecordWarning[] = [];
    const allFailures: BatchCreateResult<CreatedObjectRecord>['failures'] = [];
    let createdRecordsCount = 0;

    try {
      for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
        const batchStartIndex = batchIndex * mutationBatchSize;
        const batchedRecordsToCreate = recordsToCreate.slice(
          batchStartIndex,
          (batchIndex + 1) * mutationBatchSize,
        );

        try {
          const createdRecords = await createManyRecords({
            recordsToCreate: batchedRecordsToCreate,
            upsert,
            abortController,
          });

          createdRecordsCount += createdRecords.length;
          setBatchedRecordsCount?.(createdRecordsCount);
          allCreatedRecords.push(
            ...(createdRecords as CreatedObjectRecord[]),
          );
        } catch (batchError) {
          if (isPartialSuccessError(batchError)) {
            // Data was saved but some relation connects were skipped
            const { importWarnings, savedRecordCount } =
              extractPartialSuccessData(batchError);

            allWarnings.push(...importWarnings);
            createdRecordsCount += savedRecordCount;
            setBatchedRecordsCount?.(createdRecordsCount);
          } else if (
            CombinedGraphQLErrors.is(batchError) &&
            batchError.message.includes('aborted')
          ) {
            const formattedCreatedRecordsCount =
              formatNumber(createdRecordsCount);
            enqueueWarningSnackBar({
              message: t`Record creation stopped. ${formattedCreatedRecordsCount} records created.`,
              options: { duration: 5000 },
            });
            break;
          } else {
            // Full batch failure — record it and continue to next batch
            const errorMessage =
              batchError instanceof Error
                ? batchError.message
                : 'Unknown error';
            allFailures.push({ batchStartIndex, error: errorMessage });
          }
        }
      }
    } catch (error) {
      // Unexpected error outside the batch loop
      throw error;
    }

    await refetchAggregateQueries({
      objectMetadataNamePlural: objectMetadataItem.namePlural,
    });

    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem,
      operation: { type: 'create-many' },
    });

    return {
      records: allCreatedRecords,
      warnings: allWarnings,
      failures: allFailures,
    };
  };

  return {
    batchCreateManyRecords,
  };
};
