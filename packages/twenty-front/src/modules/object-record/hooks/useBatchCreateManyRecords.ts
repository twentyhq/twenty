import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import {
  useCreateManyRecords,
  useCreateManyRecordsProps,
} from '@/object-record/hooks/useCreateManyRecords';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useState } from 'react';

export const useBatchCreateManyRecords = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  recordGqlFields,
  skipPostOptimisticEffect = false,
  shouldMatchRootQueryFilter,
  mutationBatchSize = DEFAULT_MUTATION_BATCH_SIZE,
}: useCreateManyRecordsProps & {
  mutationBatchSize?: number;
}) => {
  const { createManyRecords } = useCreateManyRecords({
    objectNameSingular,
    recordGqlFields,
    skipPostOptimisticEffect,
    shouldMatchRootQueryFilter,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const [createdRecordsCount, setCreatedRecordsCount] = useState(0);
  const [totalRecordsCount, setTotalRecordsCount] = useState(0);

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

    setCreatedRecordsCount(0);
    setTotalRecordsCount(recordsToCreate.length);

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

        setCreatedRecordsCount((batchIndex + 1) * mutationBatchSize);
        allCreatedRecords.push(...createdRecords);
      }

      await refetchAggregateQueries();
      return allCreatedRecords;
    } finally {
      setCreatedRecordsCount(0);
    }
  };

  return {
    batchCreateManyRecords,
    createdRecordsCount,
    totalRecordsCount,
  };
};
