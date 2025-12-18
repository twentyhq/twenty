import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { useIncrementalFetchAndMutateRecords } from '@/object-record/hooks/useIncrementalFetchAndMutateRecords';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { useUpdateManyRecordsMutation } from '@/object-record/hooks/useUpdateManyRecordsMutation';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { sleep } from '~/utils/sleep';

const DEFAULT_DELAY_BETWEEN_MUTATIONS_MS = 50;

type UseIncrementalUpdateManyRecordsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'skip'
> & {
  objectNameSingular: string;
  pageSize?: number;
  delayInMsBetweenMutations?: number;
};

export const useIncrementalUpdateManyRecords = <
  T,
  UpdatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  filter,
  orderBy,
  pageSize = DEFAULT_QUERY_PAGE_SIZE,
  delayInMsBetweenMutations = DEFAULT_DELAY_BETWEEN_MUTATIONS_MS,
}: UseIncrementalUpdateManyRecordsParams<T>) => {
  const { registerObjectOperation } = useRegisterObjectOperation();

  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { updateManyRecordsMutation } = useUpdateManyRecordsMutation({
    objectNameSingular,
  });

  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const {
    incrementalFetchAndMutate,
    progress,
    isProcessing,
    updateProgress,
    cancel,
  } = useIncrementalFetchAndMutateRecords<T>({
    objectNameSingular,
    filter,
    orderBy,
    limit: pageSize,
    recordGqlFields: { id: true },
  });

  const updateManyRecordsBatch = async (
    recordIdsToUpdate: string[],
    fieldsToUpdate: Partial<UpdatedObjectRecord>,
    abortSignal: AbortSignal,
  ) => {
    await apolloCoreClient.mutate<Record<string, UpdatedObjectRecord[]>>({
      mutation: updateManyRecordsMutation,
      variables: {
        filter: { id: { in: recordIdsToUpdate } },
        data: fieldsToUpdate,
      },
      context: {
        fetchOptions: {
          signal: abortSignal,
        },
      },
    });

    if (delayInMsBetweenMutations > 0) {
      await sleep(delayInMsBetweenMutations);
    }
  };

  const incrementalUpdateManyRecords = async (
    fieldsToUpdate: Partial<UpdatedObjectRecord>,
  ) => {
    const sanitizedFieldsToUpdate = sanitizeRecordInput({
      objectMetadataItem,
      recordInput: fieldsToUpdate,
    }) as Partial<UpdatedObjectRecord>;

    let totalUpdatedCount = 0;

    await incrementalFetchAndMutate(
      async ({ recordIds, totalCount, abortSignal }) => {
        await updateManyRecordsBatch(
          recordIds,
          sanitizedFieldsToUpdate,
          abortSignal,
        );

        totalUpdatedCount += recordIds.length;

        updateProgress(totalUpdatedCount, totalCount);
      },
    );

    await refetchAggregateQueries();

    registerObjectOperation(objectMetadataItem, {
      type: 'update-many',
      result: {
        updateInputs: [sanitizedFieldsToUpdate],
      },
    });

    return totalUpdatedCount;
  };

  return { incrementalUpdateManyRecords, progress, isProcessing, cancel };
};
