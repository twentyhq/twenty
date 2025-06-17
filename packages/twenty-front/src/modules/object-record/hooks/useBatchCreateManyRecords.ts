import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import {
  useCreateManyRecords,
  useCreateManyRecordsProps,
} from '@/object-record/hooks/useCreateManyRecords';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { formatNumber } from '~/utils/format/number';

export const useBatchCreateManyRecords = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  recordGqlFields,
  skipPostOptimisticEffect = false,
  shouldMatchRootQueryFilter,
  mutationBatchSize = DEFAULT_MUTATION_BATCH_SIZE,
  setBatchedRecordsCount,
}: useCreateManyRecordsProps & {
  mutationBatchSize?: number;
  setBatchedRecordsCount?: (count: number) => void;
}) => {
  const { createManyRecords } = useCreateManyRecords({
    objectNameSingular,
    recordGqlFields,
    skipPostOptimisticEffect,
    shouldMatchRootQueryFilter,
    shouldRefetchAggregateQueries: false,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const { enqueueSnackBar } = useSnackBar();

  const abortController = new AbortController();

  const abortBatchCreateManyRecords = () => {
    abortController.abort();
  };

  const batchCreateManyRecords = async ({
    recordsToCreate,
    upsert,
  }: {
    recordsToCreate: Partial<CreatedObjectRecord>[];
    upsert?: boolean;
  }) => {
    const numberOfBatches = Math.ceil(
      recordsToCreate.length / mutationBatchSize,
    );

    setBatchedRecordsCount?.(0);

    const allCreatedRecords = [];

    try {
      for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
        const batchedRecordsToCreate = recordsToCreate.slice(
          batchIndex * mutationBatchSize,
          (batchIndex + 1) * mutationBatchSize,
        );

        const createdRecords = await createManyRecords(
          batchedRecordsToCreate,
          upsert,
          abortController,
        );

        setBatchedRecordsCount?.(
          batchIndex + 1 === numberOfBatches
            ? recordsToCreate.length
            : (batchIndex + 1) * mutationBatchSize,
        );
        allCreatedRecords.push(...createdRecords);
      }
    } catch (error) {
      if (error instanceof ApolloError && error.message.includes('aborted')) {
        const recordsCreated = formatNumber(allCreatedRecords.length);
        enqueueSnackBar(
          t`Record creation stopped. ${recordsCreated} records created.`,
          {
            variant: SnackBarVariant.Warning,
            duration: 5000,
          },
        );
      } else {
        throw error;
      }
    } finally {
      setBatchedRecordsCount?.(0);
    }

    await refetchAggregateQueries();
    return allCreatedRecords;
  };

  return {
    batchCreateManyRecords,
    abortBatchCreateManyRecords,
  };
};
