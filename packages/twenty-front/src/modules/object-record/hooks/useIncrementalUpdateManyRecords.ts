import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { useIncrementalFetchAndMutateRecords } from '@/object-record/hooks/useIncrementalFetchAndMutateRecords';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useUpdateManyRecords } from '@/object-record/hooks/useUpdateManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { getUpdatedFieldsFromRecordInput } from '@/object-record/utils/getUpdatedFieldsFromRecordInput';

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
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { updateManyRecords } = useUpdateManyRecords<UpdatedObjectRecord>({
    objectNameSingular,
  });

  const { refetchAggregateQueries } = useRefetchAggregateQueries();

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

  const incrementalUpdateManyRecords = async (
    fieldsToUpdate: Partial<UpdatedObjectRecord>,
  ) => {
    let totalUpdatedCount = 0;
    const allUpdatedRecordIds: string[] = [];

    try {
      await incrementalFetchAndMutate(
        async ({ recordIds, totalCount, abortSignal }) => {
          await updateManyRecords({
            recordIdsToUpdate: recordIds,
            updateOneRecordInput: fieldsToUpdate,
            delayInMsBetweenRequests: delayInMsBetweenMutations,
            skipRegisterObjectOperation: true,
            skipRefetchAggregateQueries: true,
            abortSignal,
          });

          totalUpdatedCount += recordIds.length;
          allUpdatedRecordIds.push(...recordIds);

          updateProgress(totalUpdatedCount, totalCount);
        },
      );
    } finally {
      await refetchAggregateQueries({
        objectMetadataNamePlural: objectMetadataItem.namePlural,
      });

      dispatchObjectRecordOperationBrowserEvent({
        objectMetadataItem,
        operation: {
          type: 'update-many',
          result: {
            updateInputs: allUpdatedRecordIds.map((recordId) => ({
              recordId,
              updatedFields: getUpdatedFieldsFromRecordInput(fieldsToUpdate),
            })),
          },
        },
      });
    }

    return totalUpdatedCount;
  };

  return { incrementalUpdateManyRecords, progress, isProcessing, cancel };
};
