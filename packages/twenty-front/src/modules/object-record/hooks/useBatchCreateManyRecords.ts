import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import {
  useCreateManyRecords,
  type useCreateManyRecordsProps,
} from '@/object-record/hooks/useCreateManyRecords';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';

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
  const { registerObjectOperation } = useRegisterObjectOperation();

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

  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const { enqueueWarningSnackBar } = useSnackBar();
  const { formatNumber } = useNumberFormat();

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
    let createdRecordsCount = 0;
    try {
      for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
        const batchedRecordsToCreate = recordsToCreate.slice(
          batchIndex * mutationBatchSize,
          (batchIndex + 1) * mutationBatchSize,
        );

        createdRecordsCount =
          batchIndex + 1 === numberOfBatches
            ? recordsToCreate.length
            : (batchIndex + 1) * mutationBatchSize;

        const createdRecords = await createManyRecords({
          recordsToCreate: batchedRecordsToCreate,
          upsert,
          abortController,
        });

        setBatchedRecordsCount?.(createdRecordsCount);
        allCreatedRecords.push(...createdRecords);
      }
    } catch (error) {
      if (error instanceof ApolloError && error.message.includes('aborted')) {
        const formattedCreatedRecordsCount = formatNumber(createdRecordsCount);
        enqueueWarningSnackBar({
          message: t`Record creation stopped. ${formattedCreatedRecordsCount} records created.`,
          options: {
            duration: 5000,
          },
        });
      } else {
        throw error;
      }
    }

    await refetchAggregateQueries();

    registerObjectOperation(objectMetadataItem, { type: 'create-many' });

    return allCreatedRecords;
  };

  return {
    batchCreateManyRecords,
  };
};
