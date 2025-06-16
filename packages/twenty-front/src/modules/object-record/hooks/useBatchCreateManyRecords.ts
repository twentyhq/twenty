import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import {
  useCreateManyRecords,
  useCreateManyRecordsProps,
} from '@/object-record/hooks/useCreateManyRecords';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

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
        );

        setBatchedRecordsCount?.((batchIndex + 1) * mutationBatchSize);
        allCreatedRecords.push(...createdRecords);
      }

      await refetchAggregateQueries();
      return allCreatedRecords;
    } finally {
      setBatchedRecordsCount?.(0);
    }
  };

  return {
    batchCreateManyRecords,
  };
};
